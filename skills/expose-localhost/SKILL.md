---
name: expose-localhost
description: Expose a local service to the public internet using ngrok. Starts a tunnel, optionally adds OAuth or WAF via Traffic Policy. Use when asked to expose, tunnel, share, or make a local service publicly accessible.
license: MIT
metadata:
  author: ngrok
  version: "2.0"
compatibility: Requires ngrok CLI installed and authenticated.
---

# Expose Localhost

Expose a local service to the public internet using ngrok. Optionally add OAuth, OWASP protection, or rate limiting via Traffic Policy.

## Prerequisites

- ngrok CLI installed (`ngrok` command available)
- Auth token configured (`ngrok config add-authtoken <TOKEN>`)

## Workflow

### Step 1: Pre-flight & Configuration

Silently verify ngrok is ready:

```bash
ngrok config check
```

If auth token missing, tell user to run: `ngrok config add-authtoken <TOKEN>` (get token at https://dashboard.ngrok.com/get-started/your-authtoken)

Then **ask all questions upfront** before doing anything:

```
Before I expose your service, I need a few details:

1. **Port**: I see your app runs on port 3000. Is that correct?
2. **Domain**: Use your dev domain, or do you have a custom domain?
3. **Access control**: Open access, or require login (Google/GitHub/etc.)?
4. **Save config?**: One-time setup, or save for reuse?
```

Do NOT mention cloud endpoints, reserved domains, or internal endpoints — those are advanced concepts the user shouldn't need to think about.

**Detecting the port**: Check `package.json` scripts for `--port`, `.env` for `PORT=`, `docker-compose.yml` for port mappings.

**Domains**: Most ngrok accounts have a free static dev domain (e.g., `something.ngrok-free.dev`). Running `ngrok http PORT` uses it automatically. Users can also provide a custom domain configured in the ngrok dashboard. Some accounts (especially new ones) may not have a dev domain yet — if ngrok fails with `ERR_NGROK_15013`, tell the user: "You don't have a dev domain yet. Claim your free one at https://dashboard.ngrok.com/domains — then we can try again."

**If user requests OAuth**, also ask: "Should only specific people be able to access it? I can restrict by email address or email domain."

After gathering answers, confirm and get a Y/n before proceeding.

### Step 2: Start the Tunnel

#### No security (simplest)

```bash
ngrok http {PORT} &
sleep 3
curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | head -1
```

With a specific domain, add `--url https://{DOMAIN}`.

#### With security (Traffic Policy)

Create the traffic policy file first, then start ngrok with it.

**OAuth-only** (default when user requests auth):

```yaml
on_http_request:
  - actions:
      - type: oauth
        config:
          provider: google
```

Replace `google` with the chosen provider (google, github, microsoft, gitlab, linkedin, twitch).

If the user requests OAuth, default to OAuth-only. Do NOT add OWASP or rate limiting unless explicitly asked — OAuth already blocks unauthenticated access.

**OAuth with email restriction** — use a separate rule with a CEL expression to deny non-matching emails. Do NOT add an `allow` field to the OAuth action.

Single email:

```yaml
on_http_request:
  - actions:
      - type: oauth
        config:
          provider: google
  - expressions:
      - "actions.ngrok.oauth.identity.email != 'user@example.com'"
    actions:
      - type: deny
        config:
          status_code: 403
```

Email domain:

```yaml
on_http_request:
  - actions:
      - type: oauth
        config:
          provider: google
  - expressions:
      - "!actions.ngrok.oauth.identity.email.endsWith('@your-company.com')"
    actions:
      - type: deny
        config:
          status_code: 403
```

Multiple emails — use `!(... in ['a@x.com', 'b@x.com'])` in the expression.

**Open-access hardening** (no auth, but wants protection):

```yaml
on_http_request:
  - actions:
      - type: rate-limit
        config:
          name: default-rate-limit
          algorithm: sliding_window
          capacity: 200
          rate: "60s"
          bucket_key:
            - conn.client_ip
      - type: owasp-crs-request
        config:
          on_error: halt

on_http_response:
  - actions:
      - type: owasp-crs-response
        config:
          on_error: halt
```

After writing the policy file, start ngrok:

```bash
ngrok http {PORT} --traffic-policy-file .ngrok/traffic-policy.yml &
sleep 3
curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | head -1
```

Add `--url https://{DOMAIN}` if using a specific domain.

### Step 3: Handle Errors

If a traffic policy action fails due to plan limitations:

1. Tell the user which specific action requires an upgrade
2. Offer to remove that action from the policy and retry
3. Do NOT suggest switching to cloud endpoints as a workaround

### Step 4: Persistent Configuration (If Requested)

Save these files to the project:

- **`.ngrok/traffic-policy.yml`** — the policy (if security was configured)
- **`.ngrok/expose.sh`**:

```bash
#!/bin/bash
set -e
echo "Your service will be at: https://{DOMAIN}"
ngrok http {PORT} --url https://{DOMAIN} --traffic-policy-file .ngrok/traffic-policy.yml
```

Omit `--traffic-policy-file` if no policy. Omit `--url` if no specific domain.

Optionally add to `package.json`:

```json
{ "scripts": { "tunnel": "bash .ngrok/expose.sh" } }
```

## Teardown

```bash
pkill ngrok
```

## Cloud Endpoints (Advanced)

Only use if the user explicitly needs a URL that persists after the agent stops (e.g., webhooks, long-lived integrations).

Requires an API key: `ngrok config add-api-key <KEY>` (get at https://dashboard.ngrok.com/api-keys)

1. Reserve domain: `ngrok api reserved-domains create --domain "{DOMAIN}"`
2. Create cloud endpoint with a traffic policy that includes `forward-internal` as the **last** action:

```bash
ngrok api endpoints create --url "https://{DOMAIN}" --bindings public --traffic-policy "$(cat .ngrok/traffic-policy.yml)"
```

The traffic policy must end with:

```yaml
- type: forward-internal
  config:
    url: https://{NAME}.internal
```

3. Start the internal agent: `ngrok http {PORT} --url https://{NAME}.internal`
4. Teardown: `ngrok api endpoints delete {ENDPOINT_ID}`
