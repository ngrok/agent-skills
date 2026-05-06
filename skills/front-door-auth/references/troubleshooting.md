# Troubleshooting

## `ERR_NGROK_15013` when creating the cloud endpoint

The user has no dev domain yet. Tell them to claim the free one at https://dashboard.ngrok.com/domains, then retry the `ngrok api endpoints create` command.

## `401 Unauthorized` from `ngrok api endpoints create`

No API key configured. Tell the user to run:

```bash
ngrok config add-api-key <KEY>
```

Get the key at https://dashboard.ngrok.com/api-keys.

## "Domain already in use"

The dev domain is already attached to another endpoint. Either pick a different domain or delete the existing endpoint:

```bash
ngrok api endpoints list
ngrok api endpoints delete <ENDPOINT_ID>
```

## App returns 401 after a successful login

- Confirm the cloud endpoint forwards to the same `*.internal` URL the agent is serving. Mismatch is the most common cause.
- Confirm the agent is running (`ngrok start --all`). If it isn't, the cloud endpoint can't forward anywhere.
- Confirm the policy includes the `add-headers` rule. Without it, the app sees no identity headers and the middleware returns 401.

## App shows "Hello, undefined"

The `X-Forwarded-User-Name` header is missing. Some providers don't return a name for all users. The middleware should fall back to `email.split('@')[0]`. Check the snippet in `references/frameworks/{framework}.md` and confirm the fallback is in place.

## Edits to `traffic-policy.yml` aren't taking effect

The cloud endpoint holds its own copy of the policy from when you created it. Push the edit:

```bash
ngrok api endpoints list
ngrok api endpoints update <ENDPOINT_ID> --traffic-policy-file traffic-policy.yml
```

## `forward-internal` action fails with "no matching endpoint"

The internal endpoint isn't running. Either:

- The agent isn't running. Start it with `ngrok start --all`.
- The agent's `ngrok.yml` has a different URL than the policy's `forward-internal.config.url`. They must match exactly, including scheme.

## Plan limit blocks a Traffic Policy action

Tell the user which action the plan blocks. The core front-door pattern uses only `oauth`, `add-headers`, `forward-internal`, and `deny`, all of which are available on the free plan as of this writing. If the user added an action that's plan-gated (e.g., `owasp-crs-request`), offer to remove it.
