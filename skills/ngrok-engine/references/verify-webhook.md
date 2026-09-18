# verify-webhook reference

Validates an inbound webhook's signature at ngrok's edge against a shared secret. On success the request continues down the action chain; on failure the chain terminates with 403 - unless `enforce: false`, which lets it continue so you can branch on the result.

## Config

```yaml
- type: verify-webhook
  config:
    provider: stripe        # a supported provider identifier
    secret: "${secrets.get('webhooks', 'stripe-signing-secret')}"
    enforce: true           # default; false = don't terminate on failure
```

## Result variables

After the action runs, later expressions can read:
- `actions.ngrok.verify_webhook.verified` (bool)
- `actions.ngrok.verify_webhook.error.message`

Branch on an unverified request when `enforce: false`:

```yaml
on_http_request:
  - actions:
      - type: verify-webhook
        config: { provider: zoom, secret: "${secrets.get('webhooks','zoom')}", enforce: false }
  - expressions: ["actions.ngrok.verify_webhook.verified == false"]
    actions:
      - type: custom-response
        config: { status_code: 407, body: "verification failed" }
```

## Supported providers

ngrok verifies signatures for 70+ providers out of the box, including Stripe, GitHub, GitLab, Bitbucket, Twilio, Slack, Shopify, Zoom, Pusher, and many more. Use the provider's identifier as `provider`. If a provider isn't built in, you can still front it - verify with a manual signature check via CEL/JWT actions, or accept and forward. For the authoritative, current provider list, consult ngrok's verify-webhook docs (this list drifts as providers are added).

## Behavior notes

- **Endpoint-verification challenges**: some providers require a one-time handshake before sending events; `verify-webhook` handles this automatically for supported providers - make sure the endpoint is running when the user saves the webhook in the provider dashboard.
- **Replay protection**: ngrok rejects requests whose signed timestamp is outside the tolerance window (provider-suggested, else ~180s). Large clock skew on the receiver can cause false rejects.
- **Body integrity**: nothing that rewrites the request body may run before this action, or the signature check fails.
- **Free-tier cap**: free accounts have a monthly validation cap; if verification stops working at volume, that's the likely cause.

## Maintainer note

Provider identifiers and result-variable names mirror ngrok's verify-webhook docs.
