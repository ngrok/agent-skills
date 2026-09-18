# `response-body-find-replace`

**Generated from ngrok's published documentation - do not hand-edit.**

Find and replace text patterns in HTTP response bodies using regular expressions.

- **Phases:** `on_http_response`
- **Ends chain:** no
- **Categories:** response-modification

## Configuration

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `replacements` | array | yes | Array of replacement rules to apply to the response body. Rules are applied in order. Minimum `1` replacement required. |
| `replacements.from` | string | yes | Regular expression pattern to match. Supports RE2 syntax. CEL interpolation is supported for dynamic patterns. Accepts CEL interpolation. |
| `replacements.to` | string | no | Replacement string. Use `$1`, `$2`, etc. to reference capture groups from the pattern. CEL interpolation is supported for dynamic replacements. If omitted or empty, matched text is deleted. Accepts CEL interpolation. |

## Result variables

Readable from `expressions` in later rules once this action has run.

- `actions.ngrok.response_body_find_replace.replacements` (array)
- `actions.ngrok.response_body_find_replace.replacements.replacement_index` (integer)
- `actions.ngrok.response_body_find_replace.replacements.matched_content` (string)

## Example

```yaml
  on_http_response:
    - actions:
        - type: response-body-find-replace
          config:
            replacements:
              # Redact SSN patterns
              - from: "\\b\\d{3}-\\d{2}-\\d{4}\\b"
                to: "[SSN REDACTED]"
              # Redact credit card numbers
              - from: "\\b\\d{4}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}\\b"
                to: "[CARD REDACTED]"
              # Redact phone numbers
              - from: "\\b\\d{3}[-.\\s]?\\d{3}[-.\\s]?\\d{4}\\b"
                to: "[PHONE REDACTED]"

```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/response-body-find-replace>
