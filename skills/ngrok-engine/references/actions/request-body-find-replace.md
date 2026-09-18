# `request-body-find-replace`

**Generated from ngrok's published documentation - do not hand-edit.**

Find and replace text patterns in HTTP request bodies using regular expressions.

- **Phases:** `on_http_request`
- **Ends chain:** no
- **Categories:** request-modification

## Configuration

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `replacements` | array | yes | Array of replacement rules to apply to the request body. Rules are applied in order. Minimum `1` replacement required. |
| `replacements.from` | string | yes | Regular expression pattern to match. Supports RE2 syntax. CEL interpolation is supported for dynamic patterns. Accepts CEL interpolation. |
| `replacements.to` | string | no | Replacement string. Use `$1`, `$2`, etc. to reference capture groups from the pattern. CEL interpolation is supported for dynamic replacements. If omitted or empty, matched text is deleted. Accepts CEL interpolation. |

## Result variables

Readable from `expressions` in later rules once this action has run.

- `actions.ngrok.request_body_find_replace.replacements` (array)
- `actions.ngrok.request_body_find_replace.replacements.replacement_index` (integer)
- `actions.ngrok.request_body_find_replace.replacements.matched_content` (string)

## Example

```yaml
  on_http_request:
    - actions:
        - type: request-body-find-replace
          config:
            replacements:
              - from: '"api_key":\s*"[^"]*"'
                to: '"api_key": "[REDACTED]"'
              - from: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"
                to: "[EMAIL REDACTED]"

```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/request-body-find-replace>
