# `compress-response`

**Generated from ngrok's published documentation - do not hand-edit.**

Compress HTTP response bodies from your upstream server.

- **Phases:** `on_http_response`
- **Ends chain:** no
- **Categories:** response-modification

## Configuration

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `algorithms` | array of strings | no | A list of allowed compression algorithms to be considered during encoding type negotiation. Each element must be unique. Values: `br`, `compress`, `deflate`, `gzip` |

## Result variables

Readable from `expressions` in later rules once this action has run.

- `actions.ngrok.compress.already_compressed` (boolean)
- `actions.ngrok.compress.negotiated_algorithm` (string)

## Example

```yaml
  on_http_response:
    - expressions:
        - "req.url.path.startsWith('/api/')"
      actions:
        - type: "compress-response"
          config:
            algorithms:
              - "gzip"
              - "br"
              - "deflate"
              - "compress"

```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/compress-response>
