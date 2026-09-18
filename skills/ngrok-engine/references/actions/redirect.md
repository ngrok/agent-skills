# `redirect`

**Generated from ngrok's published documentation - do not hand-edit.**

Redirect users through URL transformations using regular expressions.

- **Phases:** `on_http_request`
- **Ends chain:** no
- **Categories:** request-modification

## Configuration

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `from` | string | no | A regular expression pattern used to match a part of the URL. Accepts CEL interpolation. |
| `to` | string | yes | A regular expression pattern used to replace the matched part of the URL. Accepts CEL interpolation. |
| `status_code` | integer | no | A `3xx` status code used for redirecting. |
| `headers` | object | no | Map of key-value headers to be added to the response. Maximum `10` headers can be specified. Accepts CEL interpolation. |

## Result variables

Readable from `expressions` in later rules once this action has run.

- `actions.ngrok.redirect.matches` (array of strings)
- `actions.ngrok.redirect.url` (string)
- `actions.ngrok.redirect.error.code` (string)
- `actions.ngrok.redirect.error.message` (string)

## Example

```yaml
  on_http_request:
    - actions:
        - type: redirect
          config:
            from: ^(https?://[^/]+)/products(.*)$
            to: $1/store/products$2

```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/redirect>
