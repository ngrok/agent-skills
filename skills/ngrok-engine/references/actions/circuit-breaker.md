# `circuit-breaker`

**Generated from ngrok's published documentation - do not hand-edit.**

Maintain system reliability by rejecting requests when error rates exceed defined thresholds.

- **Phases:** `on_http_request`
- **Ends chain:** no
- **Categories:** traffic-control, request-modification

## Configuration

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `error_threshold` | float | yes | Threshold percentage of errors that must be met before requests are rejected. Must be a value between `0.0` and `1.0`. |
| `volume_threshold` | integer | no | Number of requests in a rolling window before checking the error threshold. Must be a number between `1` and `2,000,000,000`. |
| `window_duration` | duration | no | Number of seconds in the rolling window that metrics are retained for. Must be a value between `1s` and `2m`. |
| `tripped_duration` | duration | no | Number of seconds the system waits after rejecting a request before re-evaluating upstream health. Must be a value between `1s` and `2m`. |
| `num_buckets` | integer | no | Number of buckets that metrics are divided into within the rolling window. Fixed at `10`. |
| `enforce` | boolean | no | Determines if the circuit breaker is active. If `false`, the circuit breaker never trips, and no requests are rejected. |

## Example

```yaml
  on_http_request:
    - actions:
      - type: "circuit-breaker"
        config:
          error_threshold: 0
          volume_threshold: 1
          window_duration: "60s"
          tripped_duration: "2m"
          enforce: true

```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/circuit-breaker>
