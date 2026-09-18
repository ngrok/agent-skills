# `jwt-validation`

**Generated from ngrok's published documentation - do not hand-edit.**

Validate JSON Web Tokens (JWTs) on your incoming requests.

- **Phases:** `on_http_request`
- **Ends chain:** no
- **Categories:** security

## Configuration

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `issuer` | object | yes | Configuration object for the Issuer(s) of the JWTs. |
| `issuer.allow_list` | array of objects | yes | List of allowed issuers. Minimum `1`. |
| `issuer.allow_list[*].value` | string | yes | Issuer URL. This can be found in the `iss` claim after decoding the JWT or from the `/.well-known/openid-configuration` endpoint in your Identity Provider. Accepts CEL interpolation. |
| `audience` | object | no | Configuration object for the Audience(s) of the JWTs. |
| `audience.allow_list` | array of objects | no | List of allowed audiences. Minimum `1`. |
| `audience.allow_list[*].value` | string | no | Audience claim value. This can be found in the `aud` claim after decoding the JWT or from the request used to create the token in the first place. |
| `http` | object | yes | Configuration object for the HTTP requests containing JWTs. |
| `http.tokens` | array of objects | yes | List of tokens to validate. Minimum `1`. |
| `http.tokens[*].type` | enum | yes | Type of the JWT, which acts as a hint about how ngrok should parse the token. Values: `id_token`, `access_token`, `at+jwt`, `it+jwt`, `plain`, `jwt` |
| `http.tokens[*].method` | enum | yes | Location in the request to expect the JWT. When choosing `header`, the `content-type` header must be set to either `application/json` or `application/x-www-form-urlencoded`. Values: `header`, `body` |
| `http.tokens[*].name` | string | yes | Name of the header or body field where the JWT is expected (Example: `"Authorization"`). This is not case sensitive. Accepts CEL interpolation. |
| `http.tokens[*].prefix` | string | no | Any prefix to strip from the header or body field before parsing the JWT (Example: `"Bearer "`). Accepts CEL interpolation. |
| `jws` | object | yes | Configuration object for signed JWTs (JWS). |
| `jws.allowed_algorithms` | array of strings | yes | List of allowed signing algorithms. The value `none` is not supported here because it is insecure. Minimum `1`. |
| `jws.keys` | array of objects | yes | Configuration for the JWT signing keys. |
| `jws.keys[*].identification` | array of objects | no | JWT metadata. |
| `jws.keys[*].identification.keys[*].identification[*].token_claims` | array of strings | no | List of claims present in this token. Supported values: ['kid'] |
| `jws.keys[*].sources` | array of objects | yes | Configuration for the key material used to verify the signed JWTs. |
| `jws.keys[*].sources.keys[*].sources[*].additional_jkus` | array of strings | yes | List of URLs which serve the possible signing keys in JWKS format. These URLs are cached and refreshed roughly every 15 minutes. Accepts CEL interpolation. |

## Result variables

Readable from `expressions` in later rules once this action has run.

- `actions.ngrok.jwt_validation.tokens` (array of objects)
- `actions.ngrok.jwt_validation.tokens[i].header` (object)
- `actions.ngrok.jwt_validation.tokens[i].location` (string)
- `actions.ngrok.jwt_validation.tokens[i].location_property` (string)
- `actions.ngrok.jwt_validation.tokens[i].payload` (object)
- `actions.ngrok.jwt_validation.tokens[i].signature` (string)
- `actions.ngrok.jwt_validation.tokens[i].verified` (boolean)
- `actions.ngrok.jwt_validation.error.code` (string)
- `actions.ngrok.jwt_validation.error.message` (string)

## Example

```yaml
  on_http_request:
    - actions:
        - type: jwt-validation
          config:
            issuer:
              allow_list:
                - value: https://example.com/issuer
            audience:
              allow_list:
                - value: urn:example:api
            http:
              tokens:
                - type: access_token
                  method: header
                  name: Authorization
                  prefix: 'Bearer '
                - type: it+jwt
                  method: body
# ...truncated, see the action's docs page
```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/jwt-validation>
