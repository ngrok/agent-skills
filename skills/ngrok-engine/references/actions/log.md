# `log`

**Generated from ngrok's published documentation - do not hand-edit.**

Add log metadata to events for logging and monitoring.

- **Phases:** `on_tcp_connect`, `on_http_request`, `on_http_response`
- **Ends chain:** no
- **Categories:** connection-modification, response-modification, request-modification

## Configuration

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `metadata` | map[string]any | yes | A key-value map of metadata that you would like to include in your events for this action. Accepts CEL interpolation. |

## Result variables

Readable from `expressions` in later rules once this action has run.

- `actions.ngrok.log.metadata` (object)

## Example

```yaml
  on_http_request:
    - actions:
        - type: log
          config:
            metadata:
              message: Log action executed.
              endpoint_id: ${endpoint.id}

```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/log>
