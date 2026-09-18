# `rate-limit`

**Generated from ngrok's published documentation - do not hand-edit.**

Rate limit incoming traffic to your endpoint before it hits your upstream servers.

- **Phases:** `on_http_request`
- **Ends chain:** no
- **Categories:** traffic-control, request-modification

## Configuration

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | yes | A name for this rate limit configuration. Must be less than `1024` characters. |
| `enforce` | boolean | no | Controls whether the rate limit is actively applied at runtime. When enabled, requests exceeding the limit are blocked or throttled as configured. |
| `algorithm` | enum | yes | The rate limit algorithm to be used. Values: `sliding_window` |
| `capacity` | integer | yes | The maximum number of requests allowed to reach your upstream server. The minimum capacity is `1` and the maximum capacity is `2,000,000,000`. |
| `rate` | string | yes | The duration in which events may be limited based on the current capacity. Must be specified as a time duration that is a multiple of ten seconds (for example, `"90s"`, `"10m"`). |
| `bucket_key` | array of strings | yes | The elements of this collection define the unique key of a request to track the rate at which the capacity is being met. Each bucket key is a CEL expression which includes all valid Traffic Policy variables and macros. Values: `req.host` - The Host of the request., `conn.client_ip` - The client IP address., `getReqHeader('X-Example-Header-Name')` - The value for the specified header key, if it exists. |

## Result variables

Readable from `expressions` in later rules once this action has run.

- `actions.ngrok.rate_limit.bucket_key` (string)
- `actions.ngrok.rate_limit.limited` (boolean)
- `actions.ngrok.rate_limit.error.code` (string)
- `actions.ngrok.rate_limit.error.message` (string)

## Example

```yaml
  on_http_request:
    - actions:
        - type: rate-limit
          config:
            name: Only allow 30 requests per minute
            algorithm: sliding_window
            capacity: 30
            rate: 60s
            bucket_key:
              - 'hasReqHeader(''host'') ? getReqHeader(''host'')[0] : ''unknown'''

```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/rate-limit>
