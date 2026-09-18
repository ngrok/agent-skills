---
name: share-dev-environment
description: Give a specific person - a teammate, client, or reviewer - a temporary, access-controlled URL to your locally running work-in-progress. Combines a public tunnel with an auth policy so only intended people get in, not the whole internet, and handles dev-server quirks like hot-reload websockets and host headers. Use when the user wants to let someone preview or review a local dev site, share a work-in-progress for feedback, or hand off a temporary link that isn't wide open. Use when the user says "share my localhost with a coworker", "let my client preview my dev site", "share my dev server for review", or "temporary link to my WIP".
license: MIT
metadata:
  author: ngrok
  version: "1.0"
  category: collaboration
  surface: job
compatibility: Requires ngrok CLI installed and authenticated.
---

# Share a dev environment with someone

Expose a locally running app to a *specific* person, access-controlled, temporarily. This is `expose-localhost` plus an auth policy - the point is that it is not wide open.

## Before you start

Auth is required (`ngrok-setup`). This job always uses a Traffic Policy, so lean on `ngrok-engine` for both the auth action and the endpoint choice.

## Shape

Agent endpoint to the local dev port, with a Traffic Policy that gates access. Agent endpoint (not cloud) is right here because sharing is ephemeral - it lives as long as you're working.

## Pick the gate (match how the user described "who")

- **Named people by email / a company domain** -> `oauth` (Google/GitHub/Microsoft), then deny anyone outside the allowed emails or domain:

```yaml
on_http_request:
  - actions:
      - type: oauth
        config: { provider: google }
  - expressions:
      - "!actions.ngrok.oauth.identity.email.endsWith('@clientcompany.com')"
    actions:
      - type: deny
```

- **A client who won't log in with an IdP** -> a shared secret is friendlier. Use basic auth, or gate on a known IP if they have a stable one (`restrict-ips`).
- **"Just don't let it get indexed / stumbled on"** -> at minimum a gate above; never rely on an unguessable URL alone.

Get the exact auth action config from `ngrok-engine` (`ngrok-engine/references/auth-actions.md`).

## Dev-server gotchas (handle these or the preview breaks)

- **Hot reload / HMR websockets**: dev servers (Vite, Next, webpack) use websockets for live reload. ngrok forwards these fine, but the dev server may reject the ngrok host. Set the framework's allowed-hosts to accept the ngrok domain (e.g. Vite `server.allowedHosts`, Next `allowedDevOrigins`).
- **Host header**: many dev servers bind to `localhost` and 400 on a different Host. If the framework can't be told to accept it, rewrite the host header on the way in (`add-headers`, or the agent's host-header rewrite).
- **Absolute URLs / redirects**: apps that build links from the request host generally work because the public host is passed through; apps hardcoding `localhost` will leak it - fix in the app, not ngrok.

## Apply it

Bring up the agent endpoint with the policy on the user's surface (see `ngrok-surfaces`; the agent CLI is the common one here), then send the person the URL. Remind the user it stays live only while their agent is running.

## Notes for agents

- Always attach a gate. "Share my dev server" implies access control even if the user didn't spell it out - that's the whole difference from `expose-localhost`.
- Keep it an agent endpoint; don't provision a cloud endpoint for an ephemeral share.
