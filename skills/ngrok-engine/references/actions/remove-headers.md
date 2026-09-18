# `remove-headers`

**Generated from ngrok's published documentation - do not hand-edit.**

Remove headers from incoming requests or outgoing responses.

- **Phases:** `on_http_request`, `on_http_response`
- **Ends chain:** no
- **Categories:** request-modification, response-modification

## Configuration

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `headers` | array of strings | yes | List of header keys to remove from the request or response. Minimum `1`, Maximum `10`. |

## Result variables

Readable from `expressions` in later rules once this action has run.

- `actions.ngrok.remove_headers.headers_removed` (array of strings)

## Example

```yaml
  on_http_request:
    - actions:
        - type: remove-headers
          config:
            headers:
              - x-client-version
              - x-trace-id

```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/remove-headers>
