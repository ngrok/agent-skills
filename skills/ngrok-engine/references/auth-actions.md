# Auth actions reference

Traffic Policy actions that authenticate or restrict callers. Attach any of these in an `on_http_request` rule; combine with a follow-on `deny` rule to restrict which authenticated users pass.

## oauth

Hosted OAuth login with a managed provider. No app code.

```yaml
- type: oauth
  config:
    provider: google   # google | github | microsoft | facebook | gitlab | amazon | linkedin | twitch | ..
```

Restrict after login with a second rule reading the identity:

```yaml
- expressions: ["!actions.ngrok.oauth.identity.email.endsWith('@company.com')"]
  actions: [ { type: deny } ]
```

Identity is available as `actions.ngrok.oauth.identity.email` (and other fields per provider).

## openid-connect

Raw OIDC against any compliant IdP (Okta, Auth0, Entra, etc.). Configure the IdP with `https://idp.ngrok.com/oauth2/callback` as a redirect URI.

```yaml
- type: openid-connect
  config:
    issuer_url: "https://YOUR_ISSUER"
    client_id: ".."
    client_secret: "${secrets.get('auth','oidc-client-secret')}"
    scopes: [ openid, profile, email ]
```

## jwt-validation

Validate a bearer JWT (for service-to-service / API callers). Use for machine callers where interactive login is wrong.

```yaml
- type: jwt-validation
  config:
    issuer: { allow_list: [ { value: "https://YOUR_ISSUER" } ] }
    audience: { allow_list: [ { value: "your-api" } ] }
    # key source per current docs (JWKS URL or static keys)
```

## basic-auth

Shared username/password. Friendly for a client who won't use an IdP.

```yaml
- type: basic-auth
  config:
    credentials: [ "user:${secrets.get('auth','preview-password')}" ]
```

## restrict-ips (via deny)

There is no standalone "allow only" action; express it as deny-unless-in-list:

```yaml
- expressions: ["!(conn.client_ip in ['203.0.113.4/32','198.51.100.0/24'])"]
  actions: [ { type: deny } ]
```

## Bearer-token gate (used by test-mcp-server)

Per-caller bearer tokens matched against Vault secrets, tagging which caller passed:

```yaml
on_http_request:
  - expressions: ["req.headers['authorization'][0] == 'Bearer ' + secrets.get('mcp-callers','claude-key')"]
    actions:
      - type: add-headers
        config: { headers: { x-mcp-caller: claude } }
  - expressions: ["!req.headers.exists('x-mcp-caller')"]
    actions: [ { type: deny, config: { status_code: 401 } } ]
```

## Maintainer note
Action names, config keys, and identity/result variables mirror ngrok's Traffic Policy action docs. Auth action schemas change - verify before publishing.
