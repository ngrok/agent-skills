# Traffic Policy action catalog

**Generated from ngrok's published Traffic Policy documentation.**
Do not hand-edit: changes are overwritten when this is regenerated.
Source of truth: <https://ngrok.com/docs/gateway/traffic-policy/actions>

All 26 Traffic Policy actions. This file is the index only. Each action's config fields, result variables, and example live in `actions/<action>.md` - **read only the one(s) you need**, not the whole directory.

## How to read this

- **Phases** - the traffic phases an action may appear in. Putting an action in the wrong phase is a config error, not a no-op.
- **Ends chain** - a terminating action stops the rule chain when it fires. Every Cloud Endpoint policy must end with one; agent endpoints need not.
- Field names in the per-action files are full dotted paths, so they can be read straight into a policy body.

## Actions

| Action | Phases | Ends chain | What it does |
| --- | --- | --- | --- |
| [`add-headers`](actions/add-headers.md) | `on_http_request` `on_http_response` | no | Add headers to your incoming requests or outgoing responses. |
| [`basic-auth`](actions/basic-auth.md) | `on_http_request` | no | Enforce HTTP Basic Auth for your HTTP endpoints. |
| [`circuit-breaker`](actions/circuit-breaker.md) | `on_http_request` | no | Maintain system reliability by rejecting requests when error rates exceed defined thresholds. |
| [`close-connection`](actions/close-connection.md) | `on_http_request` `on_tcp_connect` | yes | Close a client's connection to ngrok before it is further processed or tunneled to any of your upstream services. |
| [`compress-response`](actions/compress-response.md) | `on_http_response` | no | Compress HTTP response bodies from your upstream server. |
| [`custom-response`](actions/custom-response.md) | `on_http_request` `on_http_response` | yes | Send a custom HTTP response directly back to the client. |
| [`deny`](actions/deny.md) | `on_tcp_connect` `on_http_request` | yes | Deny incoming traffic to your endpoint at the HTTP layer. |
| [`forward-internal`](actions/forward-internal.md) | `on_tcp_connect` `on_http_request` | yes | Forward traffic to an internal endpoint within the same ngrok account. |
| [`http-request`](actions/http-request.md) | `on_http_request` `on_http_response` | no | Send an HTTP request to a third-party API and return the response. |
| [`jwt-validation`](actions/jwt-validation.md) | `on_http_request` | no | Validate JSON Web Tokens (JWTs) on your incoming requests. |
| [`log`](actions/log.md) | `on_tcp_connect` `on_http_request` `on_http_response` | no | Add log metadata to events for logging and monitoring. |
| [`oauth`](actions/oauth.md) | `on_http_request` | no | Add OAuth login for your HTTP endpoints. |
| [`openid-connect`](actions/oidc.md) | `on_http_request` | no | Add OpenID Connect login for your HTTP endpoints. |
| [`owasp-crs-request`](actions/owasp-crs-request.md) | `on_http_request` | no | Add OWASP CoreRuleSet to incoming HTTP requests to your endpoints. |
| [`owasp-crs-response`](actions/owasp-crs-response.md) | `on_http_response` | no | Add OWASP CoreRuleSet to outgoing HTTP responses from your endpoints. |
| [`rate-limit`](actions/rate-limit.md) | `on_http_request` | no | Rate limit incoming traffic to your endpoint before it hits your upstream servers. |
| [`redirect`](actions/redirect.md) | `on_http_request` | no | Redirect users through URL transformations using regular expressions. |
| [`remove-headers`](actions/remove-headers.md) | `on_http_request` `on_http_response` | no | Remove headers from incoming requests or outgoing responses. |
| [`request-body-find-replace`](actions/request-body-find-replace.md) | `on_http_request` | no | Find and replace text patterns in HTTP request bodies using regular expressions. |
| [`response-body-find-replace`](actions/response-body-find-replace.md) | `on_http_response` | no | Find and replace text patterns in HTTP response bodies using regular expressions. |
| [`restrict-ips`](actions/restrict-ips.md) | `on_http_request` `on_http_response` `on_tcp_connect` | no | Allow or deny incoming traffic based on the client IP. |
| [`set-vars`](actions/set-vars.md) | `on_http_request` `on_http_response` `on_tcp_connect` | no | Set custom variables for use in your traffic policy. |
| [`sse-find-replace`](actions/sse-find-replace.md) | `on_event_stream_message` | no | Find and replace text patterns in Server-Sent Events (SSE) streams. |
| [`terminate-tls`](actions/terminate-tls.md) | `on_tcp_connect` | no | Control the behavior of TLS termination on your endpoints. |
| [`url-rewrite`](actions/url-rewrite.md) | `on_http_request` | no | Rewrite request URLs transparently using regular expressions. |
| [`verify-webhook`](actions/verify-webhook.md) | `on_http_request` | no | Validate incoming signatures against a known secret to ensure authenticity. |

## By category

- **connection modification** - `deny`, `forward-internal`, `http-request`, `log`, `restrict-ips`, `set-vars`, `terminate-tls`
- **request modification** - `add-headers`, `circuit-breaker`, `log`, `owasp-crs-request`, `rate-limit`, `redirect`, `remove-headers`, `request-body-find-replace`, `set-vars`, `url-rewrite`
- **response modification** - `add-headers`, `compress-response`, `custom-response`, `log`, `owasp-crs-response`, `remove-headers`, `response-body-find-replace`, `set-vars`, `sse-find-replace`
- **security** - `basic-auth`, `jwt-validation`, `oauth`, `openid-connect`, `owasp-crs-request`, `owasp-crs-response`, `restrict-ips`, `terminate-tls`, `verify-webhook`
- **traffic control** - `circuit-breaker`, `close-connection`, `deny`, `forward-internal`, `http-request`, `owasp-crs-request`, `owasp-crs-response`, `rate-limit`
