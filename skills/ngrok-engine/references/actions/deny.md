# `deny`

**Generated from ngrok's published documentation - do not hand-edit.**

Deny incoming traffic to your endpoint at the HTTP layer.

- **Phases:** `on_tcp_connect`, `on_http_request`
- **Ends chain:** yes
- **Categories:** traffic-control, connection-modification

## Configuration

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `status_code` | integer | no | The response status code to return back to the client when the request is denied. |

## Example

```yaml
      on_tcp_connect:
        - actions:
            - type: deny

```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/deny>
