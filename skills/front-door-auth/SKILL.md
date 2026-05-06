---
name: front-door-auth
description: Add OAuth authentication to a service without writing OAuth code. Sets up ngrok as an auth-aware front door. A public cloud endpoint runs OAuth and forwards to a private internal endpoint backing the app, which reads two trusted identity headers. Use when asked to delegate auth to ngrok, add OAuth without writing code, set up auth at the edge, build an auth-aware API gateway, or apply the front-door pattern.
license: MIT
metadata:
  author: ngrok
  version: "1.0"
compatibility: Requires ngrok CLI installed and authenticated (authtoken + API key).
---

# Front-door auth

Set up ngrok as an auth-aware front door for a service. A public cloud endpoint runs a Traffic Policy that does OAuth, identity propagation, and `forward-internal`. The app sits behind an internal endpoint (`*.internal`) that's only routable from inside the user's ngrok account. The app reads `X-Forwarded-User-Email` and `X-Forwarded-User-Name` and trusts them.

```
[ public ] → [ cloud endpoint + Traffic Policy ] → [ internal endpoint ] → [ app ]
```

## When to use

- "Add OAuth to my app without writing OAuth code"
- "Delegate auth to ngrok"
- "Use ngrok as an auth-aware API gateway"
- "Set up auth at the edge"
- "Front-door pattern"

## When NOT to use

- The user just wants to expose a local service. Use `expose-localhost` instead.
- The user needs in-app logout, MFA enrollment, RBAC mutation, or password resets. Those need a real IdP.
- The app is on a host with a publicly reachable address (e.g., `0.0.0.0` binding behind a public load balancer). The trust boundary breaks.

## Prerequisites

- ngrok CLI installed
- Authtoken: `ngrok config add-authtoken <TOKEN>` (get at https://dashboard.ngrok.com/get-started/your-authtoken)
- API key: `ngrok config add-api-key <KEY>` (get at https://dashboard.ngrok.com/api-keys)
- Free dev domain (every account gets one on signup; find at https://dashboard.ngrok.com/domains)

## Workflow

### Step 1: Detect framework and port

Inspect the project to identify:

- Framework. Check `package.json` (Hono, Express, Fastify, Next.js), `requirements.txt` or `pyproject.toml` (FastAPI, Flask), `go.mod`, `Gemfile`, etc.
- Port. Check entrypoint files, `.env`, `package.json` scripts, `docker-compose.yml`. Default to 3000 for Node/TS, 8000 for Python, 8080 for Go.

Frameworks not covered in `references/frameworks/` are still supportable. The trusted-header pattern is identical across them: read `X-Forwarded-User-Email` and `X-Forwarded-User-Name`, gate routes on whether the email is present, attach the identity to request context.

### Step 2: Ask the user upfront

Ask all questions in one block before doing anything:

```
Front-door auth setup. A few details:

1. Provider: Google, GitHub, Microsoft, GitLab, LinkedIn, or Twitch?
2. Allowlist: Anyone who can log in, or restrict to a specific email or domain?
3. Dev domain: What's your dev domain? (find at https://dashboard.ngrok.com/domains)
4. Internal endpoint name: I'll call it `<your-app>.internal`. OK or pick another?
5. Protected routes: Which paths need auth? (default: everything except `/`, `/health`, `/public/*`)
```

Confirm with a Y/n before proceeding.

### Step 3: Write `traffic-policy.yml`

Create at the project root. Substitute the user's answers into the template below.

```yaml
on_http_request:
  # Require OAuth on protected routes.
  - expressions:
      - "{PATH_EXPRESSION}"
    actions:
      - type: oauth
        config:
          provider: {PROVIDER}

  # Inject the verified identity into headers the app trusts.
  - expressions:
      - "actions.ngrok.oauth.identity.email != ''"
    actions:
      - type: add-headers
        config:
          headers:
            X-Forwarded-User-Email: "${actions.ngrok.oauth.identity.email}"
            X-Forwarded-User-Name: "${actions.ngrok.oauth.identity.name}"

  # OPTIONAL: deny anyone outside the allowlist (only include if the user asked for one).
  - expressions:
      - "actions.ngrok.oauth.identity.email != ''"
      - "{ALLOWLIST_EXPRESSION}"
    actions:
      - type: deny
        config:
          status_code: 403

  # Forward to the internal endpoint that backs the app.
  - actions:
      - type: forward-internal
        config:
          url: https://{INTERNAL_NAME}.internal
```

**Building `{PATH_EXPRESSION}`:** OR together each protected prefix using `req.url.path.startsWith('...')`. Example for `/me` and `/private`:

```
req.url.path.startsWith('/me') || req.url.path.startsWith('/private')
```

If the user gave a list of public paths instead of protected ones, invert: gate everything that does NOT match a public prefix.

**Building `{ALLOWLIST_EXPRESSION}`:**

- Single email: `actions.ngrok.oauth.identity.email != 'user@example.com'`
- Email domain: `!actions.ngrok.oauth.identity.email.endsWith('@yourcompany.com')`
- Multiple emails: `!(actions.ngrok.oauth.identity.email in ['a@x.com', 'b@x.com'])`

### Step 4: Write `ngrok.yml`

Create at `~/.config/ngrok/ngrok.yml` if it doesn't exist, or add to the existing one. Use v3 syntax:

```yaml
version: 3
agent:
  authtoken: {AUTHTOKEN}
endpoints:
  - name: app
    url: https://{INTERNAL_NAME}.internal
    upstream:
      url: localhost:{PORT}
```

The `.internal` URL suffix auto-infers internal binding, so you don't need a `bindings:` field.

### Step 5: Add trusted-header middleware

Open `references/frameworks/{framework}.md` for the project's framework and apply the snippet. Place the middleware in a sensible location for the project's structure (e.g., `src/middleware/auth.ts` for a TS project, or inline in the entry file for tiny apps).

The middleware always:

- Reads `x-forwarded-user-email` and `x-forwarded-user-name` (case-insensitive in most frameworks).
- Returns 401 if the email is missing on protected routes.
- Falls back to `email.split('@')[0]` for the name when missing, since some providers don't return a name.
- Attaches `{ email, name }` to the framework's request/context object for handlers to use.

Apply the middleware only to the routes the user said are protected. Leave public routes unmiddlewared.

### Step 6: Create the cloud endpoint

```bash
ngrok api endpoints create \
  --type cloud \
  --bindings public \
  --url https://{DEV_DOMAIN} \
  --traffic-policy-file traffic-policy.yml
```

Capture the returned endpoint ID. The user will need it to push policy edits later.

If this fails, see `references/troubleshooting.md`.

### Step 7: Start the agent

```bash
ngrok start --all &
sleep 3
```

The internal endpoint at `{INTERNAL_NAME}.internal` is now serving the app.

### Step 8: Confirm

Tell the user:

> Visit https://{DEV_DOMAIN}. You'll be redirected to {PROVIDER} to log in. After that, the app reads `X-Forwarded-User-Email` from each request. The cloud endpoint ID is `{ENDPOINT_ID}`. Keep it for pushing policy edits.

## Pushing policy edits

If the user changes `traffic-policy.yml` after setup, the cloud endpoint won't pick up the change automatically. Push it:

```bash
ngrok api endpoints update {ENDPOINT_ID} --traffic-policy-file traffic-policy.yml
```

If the ID isn't known, find it: `ngrok api endpoints list`.

## Teardown

```bash
ngrok api endpoints delete {ENDPOINT_ID}
pkill ngrok
```

## Graduating to production

The cloud endpoint is already permanent. It lives in the user's ngrok account, not the agent. The local agent is the only ephemeral piece.

For an always-on local agent, install it as a service:

```bash
sudo ngrok service install --config ~/.config/ngrok/ngrok.yml
sudo ngrok service start
```

For Kubernetes or multi-instance setups, deploy the agent as a sidecar (or its own deployment) with the same `ngrok.yml`. Multiple agents serving the same internal endpoint URL pool automatically.

The cloud endpoint, the Traffic Policy, and the app code don't change.

## Reference

- `references/frameworks/hono.md`: Hono middleware
- `references/frameworks/express.md`: Express middleware
- `references/frameworks/fastify.md`: Fastify pre-handler
- `references/frameworks/nextjs.md`: Next.js middleware (App Router)
- `references/frameworks/fastapi.md`: FastAPI dependency
- `references/frameworks/flask.md`: Flask decorator
- `references/troubleshooting.md`: Common errors
