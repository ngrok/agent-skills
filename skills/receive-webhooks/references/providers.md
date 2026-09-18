# Webhook providers reference

`verify-webhook` supports 70+ providers out of the box. Set `provider` to the provider's identifier and `secret` to its signing secret (from a Vault). See the shared `ngrok-engine/references/verify-webhook.md` for the action's behavior, result variables, replay protection, and endpoint-verification handshake.

## Commonly used identifiers
stripe, github, gitlab, bitbucket, twilio, slack, shopify, zoom, pusher, sendgrid, mailgun, svix, and many more.

For the authoritative current list, consult ngrok's verify-webhook documentation - providers are added over time, so do not treat this list as exhaustive.

## Per-provider setup shape (same for all)
1. In the provider's dashboard, find the webhook signing secret (name varies: "signing secret", "webhook secret", "app secret").
2. Store it in a Vault:
   `ngrok api secrets create --name "<provider>-signing-secret" --value "<secret>" --vault-id "$VAULT_ID"`
3. Reference it in the policy: `secret: "${secrets.get('webhooks','<provider>-signing-secret')}"`.
4. Point the provider's webhook URL at your ngrok endpoint (append the path if you route by path, e.g. `/stripe`).

## Path-routed multi-provider gateway
```yaml
on_http_request:
  - expressions: ["req.url.path.startsWith('/stripe')"]
    actions:
      - type: verify-webhook
        config: { provider: stripe, secret: "${secrets.get('webhooks','stripe-signing-secret')}" }
      - type: forward-internal
        config: { url: https://billing.internal }
  - expressions: ["req.url.path.startsWith('/github')"]
    actions:
      - type: verify-webhook
        config: { provider: github, secret: "${secrets.get('webhooks','github-signing-secret')}" }
      - type: forward-internal
        config: { url: https://ci.internal }
```

## Maintainer note
Provider identifiers mirror ngrok's verify-webhook docs.
