# Agent CLI and `ngrok.yml`

Source of truth: <https://ngrok.com/docs/gateway/agent/>

The terminal surface. Job skills bring the policy (`ngrok-engine`) and the endpoint
choice (`ngrok-engine`); this file shows how to attach them from a shell.

## One-off agent endpoint

```bash
ngrok http 8080
```

Attach a Traffic Policy from a file:

```bash
ngrok http 8080 --traffic-policy-file policy.yml
```

Request a reserved domain:

```bash
ngrok http 8080 --url https://my-app.ngrok.app
```

Non-HTTP:

```bash
ngrok tcp 22
```

A public TCP endpoint needs a reserved TCP address for a stable URL, and the address
is assigned by ngrok rather than chosen. See `ngrok-engine`.

## Internal endpoint (private receiver)

An internal endpoint has no public URL and is reachable only through a
`forward-internal` action. The `.internal` suffix on the URL is what makes it
internal:

```bash
ngrok http 8080 --url https://billing.internal
```

Internal **TCP** URLs need an explicit port:

```bash
ngrok tcp 22 --url tcp://device-1.internal:22
```

## `ngrok.yml` (declarative agent config)

Version 3 is required.

```yaml
version: 3
agent:
  authtoken: ${NGROK_AUTHTOKEN}
endpoints:
  - name: webhook-receiver
    upstream:
      url: 8080
    traffic_policy:
      on_http_request:
        - actions:
            - type: verify-webhook
              config:
                provider: stripe
                secret: ${STRIPE_WEBHOOK_SECRET}
```

Start them:

```bash
ngrok start --all
ngrok start webhook-receiver
```

Prefer `NGROK_AUTHTOKEN` in the environment over the `agent.authtoken` key whenever
the config file ships inside an image or a workload you do not fully control.

## Run as a background service

Registers a native OS service (systemd on Linux, launchd on macOS, a Windows
service). `install` only registers it - `start` is separate, and both usually need
root.

```bash
ngrok service install --config /etc/ngrok.yml
ngrok service start
```

Equivalent to `ngrok start --all`. Prefer the foreground form while first getting a
config right; a service hides its errors in the system log.

## Driving the API from the CLI

`ngrok api ..` covers resources that outlive the agent, and takes a policy as a file
instead of an escaped JSON string:

```bash
ngrok api endpoints create \
  --api-key "$NGROK_API_KEY" \
  --type cloud \
  --bindings public \
  --url "https://api.example.com" \
  --traffic-policy-file policy.yml

ngrok api vaults create --name "webhooks"
ngrok api secrets create --name "stripe-signing-secret" --value "whsec_.." --vault-id "$VAULT_ID"
```

Note the credential switch: `ngrok api` needs an **API key**, not the agent
authtoken. See `api.md`.

## Notes for agents

- Run these yourself rather than handing the user instructions.
- The policy YAML is identical to what `ngrok-engine` documents; only
  `--traffic-policy-file` / the `traffic_policy:` block is CLI-specific.

## Maintainer note

Flags and config keys mirror ngrok's agent docs, which are the source of truth.
