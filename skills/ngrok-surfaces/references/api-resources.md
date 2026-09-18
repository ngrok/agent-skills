# Provisioning resources: request and response shapes

Companion to `api.md`. Every call needs `Authorization: Bearer $NGROK_API_KEY`,
`Content-Type: application/json`, and `Ngrok-Version: 2`.

Ordering matters: a cloud endpoint's `url` comes from the reserved address, and a
credential's ACL references the endpoint URL the workload will bind. Create the
address first, the credential and endpoint after.

## Service User - `POST /service_users`

A non-human identity that owns credentials. Use one when tokens should not be tied
to an employee's account, or when you want a revocable identity per tenant.

```bash
curl -X POST https://api.ngrok.com/service_users \
  -H "Authorization: Bearer $NGROK_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Ngrok-Version: 2" \
  -d '{"name": "sandbox sbx_123 (tenant 7c9e)"}'
```

Request: `name` (string), `active` (boolean).
Response: `id` (`service_..`), `uri`, `name`, `active`, `created_at`.

**This resource has no `description` or `metadata` field** - unlike every other
resource here. The `name` is the only place to carry your identifier, so make it
parseable.

Delete: `DELETE /service_users/{id}`.

## Reserved TCP address - `POST /reserved_addrs`

A stable `host:port` for a public TCP endpoint. Hostname and port are assigned by
ngrok and cannot be chosen.

```bash
curl -X POST https://api.ngrok.com/reserved_addrs \
  -H "Authorization: Bearer $NGROK_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Ngrok-Version: 2" \
  -d '{
        "description": "SSH gateway for sandbox sbx_123",
        "metadata": "{\"tenant_id\":\"7c9e\",\"sandbox_id\":\"sbx_123\"}",
        "region": "us"
      }'
```

Request: `description`, `metadata`, `region` (one of `au`, `eu`, `ap`, `us`, `jp`,
`in`, `sa`; defaults to `us`).
Response: `id`, `uri`, `addr` (the assigned `host:port`, e.g. `1.tcp.ngrok.io:12345`),
`region`, `description`, `metadata`, `created_at`.

`addr` is the field you carry forward into the cloud endpoint's `url` as
`tcp://{addr}`.

TCP addresses are a paid-plan resource and they continue to bill until deleted.
Delete: `DELETE /reserved_addrs/{id}`.

## Reserved domain - `POST /reserved_domains`

The HTTP/TLS equivalent of a reserved address. Unlike addresses, you **choose** the
hostname.

```bash
curl -X POST https://api.ngrok.com/reserved_domains \
  -H "Authorization: Bearer $NGROK_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Ngrok-Version: 2" \
  -d '{
        "domain": "sbx-123.example.com",
        "description": "Web preview for sandbox sbx_123",
        "metadata": "{\"tenant_id\":\"7c9e\",\"sandbox_id\":\"sbx_123\"}"
      }'
```

Request: `domain` (the hostname), `description`, `metadata`.
Response: `id`, `uri`, `domain`, `cname_target`, `description`, `metadata`,
`created_at`, plus certificate management fields.

Differences from a reserved address:

- **You pick the hostname**; ngrok assigns nothing. The response echoes it as
  `domain` - there is no `addr` field.
- **`region` is deprecated here.** Domains are no longer bound to a region. Only
  reserved *addresses* take a region.
- **A custom domain needs DNS.** The response's `cname_target` must be set as a CNAME
  before traffic resolves. It is null for ngrok-owned subdomains (`*.ngrok.app`),
  which need no DNS step - use those to avoid the extra round trip per workload.

Delete: `DELETE /reserved_domains/{id}`.

## Credential (agent authtoken) - `POST /credentials`

The token an agent uses to start a session. This is the security boundary in a
multi-tenant setup.

```bash
curl -X POST https://api.ngrok.com/credentials \
  -H "Authorization: Bearer $NGROK_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Ngrok-Version: 2" \
  -d '{
        "description": "Agent authtoken for sandbox sbx_123",
        "metadata": "{\"tenant_id\":\"7c9e\",\"sandbox_id\":\"sbx_123\"}",
        "acl": ["bind:tcp://sandbox-sbx_123.internal:22"],
        "owner_id": "service_32ELIFubEAAGUeRtreNW6kr94Od"
      }'
```

Request:
- `description`, `metadata` as above.
- `acl` (string list) - `bind:` rules restricting which domains, addresses, and
  labels this token may bind. **If `acl` is omitted the token can create any
  endpoint on the account.** A rule of `"*"` is equivalent to no ACL.
  Domain rules may use a leading wildcard (`bind:*.example.com`); label rules may
  wildcard key or value (`bind:app=*`).
- `owner_id` - assigns ownership to a User or Service User. Accepts a User ID, user
  email, or SCIM User ID. Defaults to the caller. Only admins may set an owner other
  than themselves.

Response: `id`, `uri`, `token`, `description`, `metadata`, `acl`, `owner_id`,
`created_at`.

**`token` is returned only on this response** and is null on every later read. Store
it in the same code path that creates it.

Delete: `DELETE /credentials/{id}`. This immediately kills the agent's ability to
reconnect, which makes it the revocation lever for a single tenant.

## Cloud endpoint - `POST /endpoints`

An always-on endpoint that exists independently of any agent and handles connections
purely through its Traffic Policy.

```bash
curl -X POST https://api.ngrok.com/endpoints \
  -H "Authorization: Bearer $NGROK_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Ngrok-Version: 2" \
  -d '{
        "type": "cloud",
        "bindings": ["public"],
        "url": "tcp://1.tcp.ngrok.io:12345",
        "description": "SSH gateway for sandbox sbx_123",
        "metadata": "{\"tenant_id\":\"7c9e\",\"sandbox_id\":\"sbx_123\"}",
        "traffic_policy": "{\"on_tcp_connect\":[{\"actions\":[{\"type\":\"forward-internal\",\"config\":{\"url\":\"tcp://sandbox-sbx_123.internal:22\"}}]}]}"
      }'
```

Request: `type` (`cloud`), `bindings` (`["public"]`, `["internal"]`, or
`["kubernetes"]`), `url`, `description`, `metadata`, `traffic_policy`.

`traffic_policy` is a **serialized string** - YAML or JSON - not a nested object.
The readable form of the policy above:

```yaml
on_tcp_connect:
  - actions:
      - type: forward-internal
        config:
          url: tcp://sandbox-sbx_123.internal:22
```

CLI equivalent, which takes the policy as a file and avoids the escaping:

```bash
ngrok api endpoints create \
  --api-key "$NGROK_API_KEY" \
  --type cloud \
  --bindings public \
  --url "tcp://1.tcp.ngrok.io:12345" \
  --description "SSH gateway for sandbox sbx_123" \
  --traffic-policy-file policy.yml
```

Delete: `DELETE /endpoints/{id}`.

## Vaults and secrets - `POST /vaults`, `POST /secrets`

For secrets a policy reads at runtime via `${secrets.get('vault', 'name')}`. See
`ngrok-engine` for the reference syntax and `terraform.md` for the Terraform form.

```bash
ngrok api vaults create --name "tenant-secrets"
ngrok api secrets create --name "webhook-signing-secret" --value "whsec_.." --vault-id "$VAULT_ID"
```
