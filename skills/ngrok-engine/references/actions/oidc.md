# `openid-connect`

**Generated from ngrok's published documentation - do not hand-edit.**

Write `type: openid-connect` in a policy. This page is filed under the docs slug `oidc`, which is not a valid action type.

Add OpenID Connect login for your HTTP endpoints.

- **Phases:** `on_http_request`
- **Ends chain:** no
- **Categories:** security

## Configuration

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `issuer_url` | string | yes | The base URL of the Open ID provider that serves an OpenID Provider Configuration Document at `/.well-known/openid-configuration`. |
| `auth_id` | string | no | Unique authentication identifier for this provider. Used to scope the session cookie and to target this provider in login and logout paths. See Special paths. |
| `client_id` | string | no | Your OpenID Connect app's client ID. Accepts CEL interpolation. |
| `client_secret` | string | no | Your OpenID Connect app's client secret. Accepts CEL interpolation. |
| `scopes` | array of strings | no | A list of additional scopes to request when users authenticate with the identity provider. |
| `authz_url_params` | map of string to string | no | A map of additional URL parameters to apply to the authorization endpoint URL. |
| `max_session_duration` | duration | no | Defines the maximum lifetime of a session regardless of activity. |
| `idle_session_duration` | duration | no | Defines the period of inactivity after which a user's session is automatically ended, requiring re-authentication. |
| `userinfo_refresh_interval` | duration | no | How often should ngrok refresh data about the authenticated user from the identity provider. |
| `allow_cors_preflight` | boolean | no | Allow CORS preflight requests to bypass authentication checks. Enable if the endpoint needs to be accessible via CORS. |
| `auth_cookie_domain` | string | no | Sets the allowed domain for the auth cookie. |

## Result variables

Readable from `expressions` in later rules once this action has run.

- `actions.ngrok.oidc.error` (object)
- `actions.ngrok.oidc.error.code` (string)
- `actions.ngrok.oidc.error.message` (string)
- `actions.ngrok.oidc.identity` (object)
- `actions.ngrok.oidc.identity.id` (string)
- `actions.ngrok.oidc.identity.email` (string)
- `actions.ngrok.oidc.identity.name` (string)
- `actions.ngrok.oidc.identity.provider_user_id` (string)
- `actions.ngrok.oidc.identity.current_session_id` (string)
- `actions.ngrok.oidc` (object)
- `actions.ngrok.oidc.identity_token` (string)
- `actions.ngrok.oidc.access_token` (string)
- `actions.ngrok.oidc.refresh_token` (string)
- `actions.ngrok.oidc.expires_at` (string)
- `actions.ngrok.oidc.session_timed_out` (boolean)
- `actions.ngrok.oidc.session_max_duration_reached` (boolean)
- `actions.ngrok.oidc.user_info_refreshed` (boolean)

## Example

```yaml
  on_http_request:
    - actions:
        - type: openid-connect
          config:
            issuer_url: '{your issuer url}'
            client_id: '{your app''s oauth client id}'
            client_secret: '{your app''s oauth client secret}'
            scopes:
              - openid
              - profile
              - email

```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/oidc>
