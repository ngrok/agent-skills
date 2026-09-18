# `basic-auth`

**Generated from ngrok's published documentation - do not hand-edit.**

Enforce HTTP Basic Auth for your HTTP endpoints.

- **Phases:** `on_http_request`
- **Ends chain:** no
- **Categories:** security

## Configuration

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `credentials` | array of strings | yes | A list of up to 10 allowed `username:password` credential pairs. Password must be at least `8` characters and no more than `128` characters. Accepts CEL interpolation. |
| `realm` | string | no | The HTTP realm of the request as per RFC 7235 . |
| `enforce` | bool | no | If `false`, continue to the next action even if basic authentication failed. This is useful for handling fall-through, debugging, and testing purposes. |

## Result variables

Readable from `expressions` in later rules once this action has run.

- `actions.ngrok.basic_auth.credentials.presented` (bool)
- `actions.ngrok.basic_auth.credentials.username` (string)
- `actions.ngrok.basic_auth.credentials.authorized` (bool)

## Example

```yaml
  on_http_request:
    - actions:
      - type: "basic-auth"
        config:
          realm: "sample-realm"
          credentials:
            - "user:password1"
            - "admin:password2"
          enforce: true
      - type: "custom-response"
        config:
          status_code: 200
          headers:
            content-type: "text/plain"
          body: "Successfully Authenticated!"

```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/basic-auth>
