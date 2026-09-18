# custom-response reference

Return a response directly from ngrok's edge without contacting the upstream. Terminating - stops the action chain. Uses: maintenance pages, health checks, friendly block messages, and static challenge/verification responses.

## Config

```yaml
- type: custom-response
  config:
    status_code: 200
    headers:
      content-type: text/plain
    body: "ok"
```

## Interpolation

`body` and header values support CEL interpolation, so you can echo request context or timing:

```yaml
- type: custom-response
  config:
    status_code: 503
    headers:
      content-type: text/html
      retry-after: "120"
    body: "<html><body><h1>Back soon</h1><p>Path: ${req.url.path}</p></body></html>"
```

## Common patterns

Maintenance window for everything (put this rule first, remove it when done):
```yaml
on_http_request:
  - actions:
      - type: custom-response
        config: { status_code: 503, headers: { content-type: text/html }, body: "<h1>Maintenance</h1>" }
```

Health check handled at the edge (never wakes the upstream):
```yaml
on_http_request:
  - expressions: ["req.url.path == '/healthz'"]
    actions:
      - type: custom-response
        config: { status_code: 200, body: "ok" }
```

Friendly block instead of a bare 403:
```yaml
on_http_request:
  - expressions: ["req.url.path.startsWith('/admin')"]
    actions:
      - type: custom-response
        config: { status_code: 403, headers: { content-type: text/html }, body: "<h1>Not available</h1>" }
```

## Maintainer note
Config keys and interpolation variables mirror ngrok's custom-response docs.
