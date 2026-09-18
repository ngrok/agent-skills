# `sse-find-replace`

**Generated from ngrok's published documentation - do not hand-edit.**

Find and replace text patterns in Server-Sent Events (SSE) streams.

- **Phases:** `on_event_stream_message`
- **Ends chain:** no
- **Categories:** response-modification

## Configuration

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `replacements` | array | yes | Array of replacement rules to apply to SSE messages. Rules are applied in order. Minimum `1` replacement required. |
| `replacements.field` | string | no | The SSE field to apply the replacement to. Valid values are `data` and `retry`. Defaults to `data` if not specified. CEL interpolation is supported. |
| `replacements.from` | string | yes | Regular expression pattern to match. Supports RE2 syntax. CEL interpolation is supported for dynamic patterns. Accepts CEL interpolation. |
| `replacements.to` | string | no | Replacement string. Use `$1`, `$2`, etc. to reference capture groups from the pattern. CEL interpolation is supported for dynamic replacements. If omitted or empty, matched text is deleted. Accepts CEL interpolation. |

## Result variables

Readable from `expressions` in later rules once this action has run.

- `actions.ngrok.sse_find_replace.replacements` (array)
- `actions.ngrok.sse_find_replace.replacements.replacement_index` (integer)
- `actions.ngrok.sse_find_replace.replacements.matched_content` (string)

## Example

```yaml
  on_event_stream_message:
    - actions:
        - type: sse-find-replace
          config:
            replacements:
              # Redact SSN patterns in streaming content
              - field: data
                from: "\\d{3}-\\d{2}-\\d{4}"
                to: "[SSN REDACTED]"
              # Redact email addresses
              - field: data
                from: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"
                to: "[EMAIL REDACTED]"

```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/sse-find-replace>
