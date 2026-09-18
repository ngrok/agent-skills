# `forward-internal`

**Generated from ngrok's published documentation - do not hand-edit.**

Forward traffic to an internal endpoint within the same ngrok account.

- **Phases:** `on_tcp_connect`, `on_http_request`
- **Ends chain:** yes
- **Categories:** traffic-control, connection-modification

## Configuration

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `url` | string | yes | The endpoint to forward to, such as `http://my-internal-endpoint.internal:1234`. Accepts CEL interpolation. |
| `on_error` | enum | no | Whether or not further actions in the Traffic Policy should run if there is an error. Values: `halt` (default), `continue` |

## Result variables

Readable from `expressions` in later rules once this action has run.

- `actions.ngrok.forward_internal.url` (string)
- `actions.ngrok.forward_internal.error.code` (string)
- `actions.ngrok.forward_internal.error.message` (string)

## Example

```yaml
  on_http_request:
    - actions:
        - type: forward-internal
          config:
            url: https://example.internal

```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/forward-internal>
