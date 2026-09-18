# `terminate-tls`

**Generated from ngrok's published documentation - do not hand-edit.**

Control the behavior of TLS termination on your endpoints.

- **Phases:** `on_tcp_connect`
- **Ends chain:** no
- **Categories:** connection-modification, security

## Configuration

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `min_version` | string | no | The minimum TLS version to support. Must be one of `1.2` or `1.3`. |
| `max_version` | string | no | The maximum TLS version to support. Must be one of `1.2` or `1.3`. |
| `server_private_key` | string | no | The PEM-encoded private key for the server if using a custom certificate (must be specified with `server_certificate`). Accepts CEL interpolation. |
| `server_certificate` | string | no | The PEM-encoded certificate for the server if using a custom certificate (must be specified with `server_private_key`). Accepts CEL interpolation. |
| `mutual_tls_certificate_authorities` | array of strings | no | A list of PEM-encoded Certificate Authority certificates and/or Certificate Authority IDs that are trusted for mutual TLS authentication. Accepts CEL interpolation. |
| `mutual_tls_verification_strategy` | string | no | The strategy to use for mutual TLS verification. Require and verify Require any Request |

## Example

```yaml
  on_tcp_connect:
    - actions:
        - type: terminate-tls
          config:
            min_version: '1.3'
            max_version: '1.3'

```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/terminate-tls>
