# `url-rewrite`

**Generated from ngrok's published documentation - do not hand-edit.**

Rewrite request URLs transparently using regular expressions.

- **Phases:** `on_http_request`
- **Ends chain:** no
- **Categories:** request-modification

## Configuration

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `from` | string | no | A regular expression pattern used to match a part of the URL. Supports CEL Interpolation. Accepts CEL interpolation. |
| `to` | string | yes | A regular expression pattern used to replace the matched part of the URL. Supports CEL Interpolation. Accepts CEL interpolation. |

## Result variables

Readable from `expressions` in later rules once this action has run.

- `actions.ngrok.url_rewrite.matches` (array of strings)
- `actions.ngrok.url_rewrite.url` (string)
- `actions.ngrok.url_rewrite.error.code` (string)
- `actions.ngrok.url_rewrite.error.message` (string)

## Example

```yaml
  on_http_request:
    - expressions:
        - req.url.path == '/products'
      actions:
        - type: url-rewrite
          config:
            from: /products
            to: /products.php

```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/url-rewrite>
