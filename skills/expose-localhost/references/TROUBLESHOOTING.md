# Troubleshooting

## OWASP False Positives

The OWASP Core Rule Set may block legitimate requests that look like attacks. To fix, identify the rule ID from the ngrok dashboard and exclude it:

```yaml
- type: owasp-crs-request
  config:
    on_error: halt
    exclude_rule_ids:
      - 942100  # Example: SQL injection rule
```

## OAuth Callback URL

For custom OAuth apps (not ngrok's managed providers), set the callback URL to:

```
https://idp.ngrok.com/oauth2/callback
```

Managed providers (Google, GitHub, Microsoft, GitLab, LinkedIn, Twitch) need no configuration.

## Rate Limit 429s

The default policy sets 200 requests/minute per IP. To adjust, change `capacity` in the rate-limit action and restart ngrok.

## Dev Server Rejects the ngrok Host

Symptom: the app works on `localhost` but returns **400 Bad Request** through the
ngrok URL, or the page loads but hot reload never fires.

Dev servers bind to `localhost` and refuse requests arriving with a different Host
header. Allow the ngrok domain in the framework's config:

| Framework | Setting |
| --- | --- |
| Vite | `server.allowedHosts` |
| Next.js | `allowedDevOrigins` |
| webpack-dev-server | `allowedHosts` |
| Angular CLI | `--allowed-hosts` |

If the framework cannot be told to accept it, rewrite the Host header at the edge
instead:

```yaml
on_http_request:
  - actions:
      - type: add-headers
        config:
          headers:
            host: localhost:{PORT}
```

## Hot Reload Does Not Fire

Live reload runs over a websocket. ngrok forwards websockets without extra
configuration, so this is almost always the same Host/allowed-hosts problem above —
fix that first. If the socket still fails, check the dev server is not hardcoding
`ws://localhost:{PORT}` as the client-side endpoint; it needs to use the page's own
origin.

## Links Point at localhost

An app that builds absolute URLs from the request host works through ngrok
unchanged. One that hardcodes `http://localhost:{PORT}` leaks it into links and
redirects. Fix that in the application — it is not something ngrok can rewrite
reliably.
