# Terraform provider

Source of truth: <https://registry.terraform.io/providers/ngrok/ngrok/latest/docs>

For ngrok resources known at deploy time and checked into a repo. If the set of
resources is not known in advance - one per tenant, sandbox, or device - use the
REST API instead (`api.md`), not generated Terraform.

Authenticate the provider with an ngrok **API key**, not an agent authtoken.

## Cloud endpoint with a policy

`traffic_policy` takes a string. The provider's own example builds it with
`jsonencode`, which keeps everything in HCL:

```hcl
resource "ngrok_cloud_endpoint" "example" {
  url         = "https://app.example.com"
  description = "Production cloud endpoint"
  metadata    = jsonencode({ environment = "production" })

  traffic_policy = jsonencode({
    on_http_request = [
      {
        actions = [
          { type = "forward-internal", config = { url = "https://app.internal" } }
        ]
      }
    ]
  })
}
```

To share one policy across surfaces, keep it in a `.yaml` and load it instead -
the same file then works from the CLI and the SDKs unchanged:

```hcl
traffic_policy = file("${path.module}/policy.yaml")
```

## Vaults and secrets

The secret resource is `ngrok_secret` (not `ngrok_vault_secret`):

```hcl
resource "ngrok_vault" "example" {
  name = "webhooks"
}

resource "ngrok_secret" "stripe" {
  name        = "stripe-signing-secret"
  value       = var.stripe_signing_secret
  vault_id    = ngrok_vault.example.id
  description = "Consumed by the verify-webhook action"
  metadata    = jsonencode({ environment = "production" })
}
```

Reference it from a policy with
`${secrets.get('webhooks', 'stripe-signing-secret')}` - see `traffic-policy`.

## The full resource set

18 resources, named `ngrok_<name>`:

| Area | Resources |
| --- | --- |
| Endpoints and addressing | `cloud_endpoint`, `domain`, `tcp_address`, `agent_ingress` |
| Identity and credentials | `api_key`, `credential`, `service_user`, `ssh_credential` |
| Secrets | `vault`, `secret` |
| IP policy | `ip_policy`, `ip_policy_rule`, `ip_restriction` |
| TLS / SSH | `certificate_authority`, `ssh_certificate_authority`, `tls_certificate` |
| Events | `event_destination`, `event_subscription` |

Note there is no `ngrok_endpoint` and no `ngrok_reserved_domain`/`ngrok_reserved_addr` -
the names are `cloud_endpoint`, `domain`, and `tcp_address`.

`service_user`, `credential`, and `tcp_address` are the per-tenant provisioning set.
If those are being created per workload at runtime rather than at deploy time, that
is the REST API's job - see `provision-tenant-access`.

## Maintainer note

Resource names and the example schemas were verified against the published
provider docs for **ngrok/ngrok v0.8.1**. Pin expectations to a provider version:
IaC schemas drift, and the resource list above is version-specific.
