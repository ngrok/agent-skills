# `http-request`

**Generated from ngrok's published documentation - do not hand-edit.**

Send an HTTP request to a third-party API and return the response.

- **Phases:** `on_http_request`, `on_http_response`
- **Ends chain:** no
- **Categories:** traffic-control, connection-modification

## Configuration

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `url` | string | yes | The destination URL for the HTTP request. Accepts CEL interpolation. |
| `method` | enum | no | The HTTP method to use for the request. Values: `GET` (default), `PUT`, `POST`, `PATCH`, `DELETE`, `OPTIONS` |
| `query_params` | list of objects | no | A list of query parameters to append to the URL. Each item is an object with the following structure: ```yaml theme={null} - key: "parameter_name" value: "parameter_value" ``` Maximum: `32` entries. Key max length: `128` chars. Accepts CEL interpolation. |
| `headers` | object | no | A map of HTTP headers to include in the request. Keys are header names and values are header values. Maximum: `10` entries. Accepts CEL interpolation. |
| `body` | string | no | The body of the HTTP request. Supported on methods like `POST`, `PUT`, or `PATCH`. Accepts CEL interpolation. |
| `max_redirects` | int | no | The maximum number of HTTP redirects to follow. The minimum allowed is `0`. The maximum allowed is `100`. |
| `timeout` | duration | no | The maximum duration as a duration string to wait for the entire request (including retries and redirects). The minimum allowed is `1s`. The maximum allowed is `30s`. |
| `retry_condition` | string | no | A CEL expression evaluated after each failed attempt. If `true`, the request is retried (up to `3` times). Values: `attempts` (`int`): Total number of attempts so far, `last_attempt.req`: The last request object, `last_attempt.res`: The last response object (if any), `last_attempt.error`: The error string (if any) Accepts CEL interpolation. |
| `on_error` | enum | no | Determines how to proceed if the HTTP request fails. Values: `continue` (default) – Proceed with remaining actions, `halt` – Stop processing the policy |

## Result variables

Readable from `expressions` in later rules once this action has run.

- `actions.ngrok.http_request.error.code` (string)
- `actions.ngrok.http_request.error.message` (string)
- `actions.ngrok.http_request.attempts` (array of objects)
- `actions.ngrok.http_request.attempts[i].resolved_ip` (string)
- `actions.ngrok.http_request.attempts[i].response_header` (object)
- `actions.ngrok.http_request.attempts[i].response_status_code` (int)
- `actions.ngrok.http_request.attempts[i].response_time_ms` (string)
- `actions.ngrok.http_request.req` (object)
- `actions.ngrok.http_request.req.method` (string)
- `actions.ngrok.http_request.req.header` (object)
- `actions.ngrok.http_request.req.url` (string)
- `actions.ngrok.http_request.req.body` (string)
- `actions.ngrok.http_request.res` (object)
- `actions.ngrok.http_request.res.resolved_ip` (string)
- `actions.ngrok.http_request.res.header` (object)
- `actions.ngrok.http_request.res.status_code` (int)
- `actions.ngrok.http_request.res.time_ms` (string)
- `actions.ngrok.http_request.res.body` (string)

## Example

```yaml
  on_http_request:
    - name: BasicInternalRequest
      actions:
        - type: http-request
          config:
            url: https://upstream-service.internal/ping

```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/http-request>
