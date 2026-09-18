# `restrict-ips`

**Generated from ngrok's published documentation - do not hand-edit.**

Allow or deny incoming traffic based on the client IP.

- **Phases:** `on_http_request`, `on_http_response`, `on_tcp_connect`
- **Ends chain:** no
- **Categories:** security, connection-modification

## Configuration

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `enforce` | boolean | yes | Default true. If false, continue to the next action even if the IP is not permitted. |
| `allow` | array of strings | no | A list of CIDRs that are allowed. Accepts CEL interpolation. |
| `deny` | array of strings | no | A list of CIDRs that are denied. Accepts CEL interpolation. |
| `ip_policies` | array of refs | no | List of IP Policy identifiers to be checked if the source IP is allowed access. |

## Result variables

Readable from `expressions` in later rules once this action has run.

- `actions.ngrok.restrict_ips.action` (string)
- `actions.ngrok.restrict_ips.matched_cidr` (string)
- `actions.ngrok.restrict_ips.error.code` (string)
- `actions.ngrok.restrict_ips.error.message` (string)

## Example

```yaml
  on_tcp_connect:
    - actions:
        - type: restrict-ips
          config:
            enforce: true
            allow:
              - 1.1.1.1/32
            deny:
              - 110.0.0.0/8

```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/restrict-ips>
