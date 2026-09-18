# `oauth`

**Generated from ngrok's published documentation - do not hand-edit.**

Add OAuth login for your HTTP endpoints.

- **Phases:** `on_http_request`
- **Ends chain:** no
- **Categories:** security

## Configuration

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `provider` | string | yes | The name of the *OAuth* identity provider to be used for authentication. |
| `auth_id` | string | no | Unique authentication identifier for this provider. Used to scope the session cookie and to target this provider in login and logout paths. See Special paths. |
| `client_id` | string | no | Your OAuth app's client ID. Leave this empty if you want to use ngrok's managed application. Accepts CEL interpolation. |
| `client_secret` | string | no | Your OAuth app's client secret. Leave this empty if you want to use a managed application. Accepts CEL interpolation. |
| `scopes` | array of strings | no | A list of additional scopes to request when users authenticate with the identity provider. |
| `authz_url_params` | map of string to string | no | A map of additional URL parameters to apply to the authorization endpoint URL. |
| `max_session_duration` | duration | no | Defines the maximum lifetime of a session regardless of activity. |
| `idle_session_timeout` | duration | no | Defines the period of inactivity after which a user's session is automatically ended, requiring re-authentication. |
| `userinfo_refresh_interval` | duration | no | How often should ngrok refresh data about the authenticated user from the identity provider. |
| `allow_cors_preflight` | boolean | no | Allow CORS preflight requests to bypass authentication checks. Enable this if the endpoint needs to be accessible via CORS. |
| `auth_cookie_domain` | string | no | Sets the allowed domain for the auth cookie. |

## Result variables

Readable from `expressions` in later rules once this action has run.

- `actions.ngrok.oauth.error` (object)
- `actions.ngrok.oauth.error.actions.ngrok.oauth.error.code` (string)
- `actions.ngrok.oauth.error.actions.ngrok.oauth.error.message` (string)
- `actions.ngrok.oauth.identity` (object)
- `actions.ngrok.oauth.identity.actions.ngrok.oauth.identity.id` (string)
- `actions.ngrok.oauth.identity.actions.ngrok.oauth.identity.email` (string)
- `actions.ngrok.oauth.identity.actions.ngrok.oauth.identity.name` (string)
- `actions.ngrok.oauth.identity.actions.ngrok.oauth.identity.provider_user_id` (string)
- `actions.ngrok.oauth.identity.actions.ngrok.oauth.identity.current_provider_session_id` (string)
- `actions.ngrok.oauth` (object)
- `actions.ngrok.oauth.actions.ngrok.oauth.access_token` (string)
- `actions.ngrok.oauth.actions.ngrok.oauth.refresh_token` (string)
- `actions.ngrok.oauth.actions.ngrok.oauth.expires_at` (string)
- `actions.ngrok.oauth.actions.ngrok.oauth.session_timed_out` (boolean)
- `actions.ngrok.oauth.actions.ngrok.oauth.session_max_duration_reached` (boolean)
- `actions.ngrok.oauth.actions.ngrok.oauth.userinfo_refreshed` (boolean)

## Example

```yaml
  on_http_request:
    - actions:
        - type: oauth
          config:
            provider: google

```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/oauth>
