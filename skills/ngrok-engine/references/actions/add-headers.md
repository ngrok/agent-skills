# `add-headers`

**Generated from ngrok's published documentation - do not hand-edit.**

Add headers to your incoming requests or outgoing responses.

- **Phases:** `on_http_request`, `on_http_response`
- **Ends chain:** no
- **Categories:** request-modification, response-modification

## Configuration

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `headers` | object | no | Map of header key to header value to be added. Minimum `1`, Maximum `10`. Accepts CEL interpolation. |

## Result variables

Readable from `expressions` in later rules once this action has run.

- `actions.ngrok.add_headers.headers_added` (object)

## Example

```yaml
  on_http_request:
    - actions:
      - type: "add-headers"
        config:
          headers:
            x-client-ip: "${conn.client_ip}"

```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/add-headers>
