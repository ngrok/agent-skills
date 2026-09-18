# `custom-response`

**Generated from ngrok's published documentation - do not hand-edit.**

Send a custom HTTP response directly back to the client.

- **Phases:** `on_http_request`, `on_http_response`
- **Ends chain:** yes
- **Categories:** response-modification

## Configuration

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `status_code` | integer | no | Status code of the custom response being sent back. |
| `body` | string | no | Body of the custom response being sent back. Accepts CEL interpolation. |
| `headers` | object | no | Map of key-value headers of the custom response to be sent back. If `content-type` is not included in `headers`, this action will attempt to infer the correct `content-type`. Maximum properties `10`. Accepts CEL interpolation. |

## Example

```yaml
  on_http_request:
    - actions:
        - type: custom-response
          config:
            status_code: 503
            body: <html><body><h1>Service Unavailable</h1><p>Our servers are currently down for maintenance. Please check back later.</p></body></html>
            headers:
              content-type: text/html

```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/custom-response>
