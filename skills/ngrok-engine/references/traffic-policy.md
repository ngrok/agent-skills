# Traffic Policy: grammar and the common actions

Companion to `ngrok-engine`. Traffic Policy is ngrok's configuration language for managing traffic in ngrok's cloud, before it reaches the upstream service. You write rules in YAML; ngrok evaluates them at the edge.

Source of truth: <https://ngrok.com/docs/gateway/traffic-policy/>

This file covers the grammar and the common actions. Do not restate a whole surface's apply steps here; those live in `ngrok-surfaces`.

## Grammar

A policy is a set of rules grouped by traffic phase. Each rule has optional `expressions` (conditions) and a list of `actions` that run when the expressions match.

```yaml
on_http_request:
  - name: optional-rule-name
    expressions:
      - "req.url.path.startsWith('/admin')"
    actions:
      - type: deny
on_http_response:
  - actions:
      - type: add-headers
        config:
          headers:
            x-processed-by: ngrok
```

Key points:
- **Phases**: `on_http_request` and `on_http_response` for HTTP; `on_tcp_connect` for TCP; `on_event_stream_message` for server-sent events. Most policies use `on_http_request`. A TCP endpoint has no request to inspect, so only connection-level actions and expressions (`conn.client_ip` and friends) apply there - `restrict-ips`, `deny`, and `forward-internal` work; anything reading `req.*` does not.
- **Rules run in order.** Within a rule, actions run in order. A terminating action (like `deny`, `custom-response`, or a failed `verify-webhook`) stops the chain.
- **Expressions are CEL** (Common Expression Language). Omit `expressions` to make a rule always run. All expressions in a rule must be true for its actions to fire.
- Config version 3 is required when a policy is embedded in an agent config file. The policy body itself (the `on_http_request` block) is the same across every surface - only how you attach it differs (see the surface skills).

### CEL expressions

Common variables: `req.url.path`, `req.url.query`, `req.method`, `req.host`, `conn.client_ip`, `conn.client_ip.geo.location.country_code`, and action outputs like `actions.ngrok.oauth.identity.email` or `actions.ngrok.verify_webhook.verified`.

```yaml
expressions:
  - "req.method != 'GET'"
  - "conn.client_ip.geo.location.country_code == 'US'"
  - "req.url.path.startsWith('/api/')"
```

## Secrets and Vaults

Never hardcode a secret in a policy. Store it in a Vault and reference it with `secrets.get`:

```yaml
secret: "${secrets.get('my-vault', 'stripe-signing-secret')}"
```

Create the vault and secret once (shown here via the API; see the surface skills for Terraform/SDK equivalents):

```bash
ngrok api vaults create --name "my-vault"
ngrok api secrets create --name "stripe-signing-secret" --value "whsec_.." --vault-id "$VAULT_ID"
```

Environment-variable interpolation (`${VAR}`) also works for local/dev policies, but Vaults are preferred for anything shared or production.

---

## The full action set

There are 26 actions. The seven written out below are the ones the existing job skills happen to use - they are not the interesting half. This is the whole vocabulary:

**When the task needs anything beyond the seven below, look it up - do not guess the config.** Guessing is how an agent emits a policy that fails to validate. Two steps, in this order:

1. `action-catalog.md` - the index. One row per action: phases, whether it ends the chain, what it does.
2. `actions/<action>.md` - that action's config fields, result variables, and an example.

Read only the action file you need. The whole directory is ~12k tokens; one action is a few hundred.

Both tiers are generated from ngrok's published docs - do not hand-edit them.

## The common actions

These are the actions you will reach for most. Each is copy-pasteable. Detailed variants live in this directory.

### forward-internal

Forward a request to an internal endpoint - a service bound as `internal` that has no public URL. The core of the "verify at the edge, keep the receiver private" pattern.

```yaml
on_http_request:
  - actions:
      - type: forward-internal
        config:
          url: https://billing.internal
```

Route by path to different internal services:

```yaml
on_http_request:
  - expressions: ["req.url.path.startsWith('/api/')"]
    actions:
      - type: forward-internal
        config: { url: https://api.internal }
  - expressions: ["req.url.path.startsWith('/app/')"]
    actions:
      - type: forward-internal
        config: { url: https://app.internal }
```

Forward a raw TCP connection - SSH, RDP, a database. The phase is `on_tcp_connect`, and the internal URL needs an explicit port:

```yaml
on_tcp_connect:
  - actions:
      - type: forward-internal
        config:
          url: tcp://device-1.internal:22
```

See `endpoints.md` for how to create the internal endpoint this forwards to.

### oauth

Require login with an identity provider before the request reaches the upstream. No app code.

```yaml
on_http_request:
  - actions:
      - type: oauth
        config:
          provider: google
```

Restrict to specific users after login (combine with a second rule):

```yaml
on_http_request:
  - actions:
      - type: oauth
        config: { provider: google }
  - expressions:
      - "!actions.ngrok.oauth.identity.email.endsWith('@yourcompany.com')"
    actions:
      - type: deny
```

Supported providers include Google, GitHub, Microsoft, and others. For raw OIDC use the `openid-connect` action. See `auth-actions.md`.

### restrict-ips

Allow or deny by client IP / CIDR.

```yaml
on_http_request:
  - actions:
      - type: restrict-ips
        config:
          enforce: true
          allow:
            - 203.0.113.4/32
            - 198.51.100.0/24
```

Use `restrict-ips` for ranges. `conn.client_ip in [...]` does exact string
comparison: it matches a bare address (`'203.0.113.4'`) but never a CIDR, because
`203.0.113.4` is not equal to the string `203.0.113.4/32` - so a list of CIDRs
matches nothing and the rule denies everyone. `restrict-ips` is what evaluates
CIDRs. A CEL `in` test is fine for a couple of exact addresses.

### deny

Terminate a request with a 404 (default) or a chosen status. Terminating - nothing after it runs.

```yaml
on_http_request:
  - expressions: ["req.url.path.startsWith('/admin')"]
    actions:
      - type: deny
        config:
          status_code: 403
```

### custom-response

Return a response directly from the edge, without touching the upstream. Use for maintenance pages, health checks, and friendly block messages. Terminating.

```yaml
on_http_request:
  - expressions: ["req.url.path == '/healthz'"]
    actions:
      - type: custom-response
        config:
          status_code: 200
          headers: { content-type: text/plain }
          body: "ok"
```

Maintenance page for everything:

```yaml
on_http_request:
  - actions:
      - type: custom-response
        config:
          status_code: 503
          headers: { content-type: text/html }
          body: "<html><body><h1>Back soon</h1></body></html>"
```

See `custom-response.md` for templating with request variables.

### add-headers

Inject request or response headers. Rarely the whole job - usually a step before `forward-internal` or on the response. Pair with `remove-headers` to strip.

```yaml
on_http_request:
  - actions:
      - type: add-headers
        config:
          headers:
            x-forwarded-by: ngrok
            authorization: "Bearer ${secrets.get('my-vault', 'upstream-token')}"
```

### verify-webhook

Validate an inbound webhook's signature at the edge. Fails closed with 403 unless `enforce: false`. See `receive-webhooks` for the full job and `verify-webhook.md` for the provider list and replay-protection details.

```yaml
on_http_request:
  - actions:
      - type: verify-webhook
        config:
          provider: stripe
          secret: "${secrets.get('webhooks', 'stripe-signing-secret')}"
      - type: forward-internal
        config: { url: https://billing.internal }
```

---

## Applying a policy

The policy body above is identical on every surface. How you attach it differs:
See `ngrok-surfaces`, which routes from the user's project to the agent CLI, an SDK, the REST API, Terraform, or the Kubernetes operator, and carries the attachment syntax for each.

## Chaining actions

Most actions publish result variables under `actions.ngrok.<action>.*` once they run. A later rule reads them in `expressions` to branch on what happened. This is how you compose behavior, rather than looking for one action that does everything:

```yaml
on_http_request:
  - actions:
      - type: oauth
        config: { provider: google }
  - expressions:
      - "!actions.ngrok.oauth.identity.email.endsWith('@yourcompany.com')"
    actions:
      - type: deny
```

`action-catalog.md` lists the result variables for every action - check there before writing an expression against one, because the shapes differ (some are flat booleans, some are arrays of objects).

Note that many actions already enforce on their own: `rate-limit` returns 429 itself, `jwt-validation` rejects an unsigned request, `verify-webhook` fails closed. Read the action's entry before adding a `deny` that duplicates what the action already does.

### Terminating actions

A terminating action ends the chain when it fires - `deny`, `custom-response`, `forward-internal`, and `close-connection` are the common ones. The catalog marks every action's terminating status.

**Every Cloud Endpoint policy must end with a terminating action.** Agent endpoints have no such requirement, because they have an upstream to fall through to; a cloud endpoint does not, so a policy that ends without one has nowhere to send the traffic.
