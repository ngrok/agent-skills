# REST API (`api.ngrok.com`)

Source of truth: <https://ngrok.com/docs/api-reference/>

This surface is for code that creates ngrok resources at runtime - a controlplane spinning up a sandbox, a provisioner onboarding a customer, a job that hands a device its own credentials.

Pick this surface over Terraform (`terraform.md`) when the set of resources is not known at deploy time. Terraform is right for "my account has these three endpoints"; the API is right for "every sandbox gets its own endpoint, and there will be thousands of them."

Note the split: this API creates the *cloud-side* resources. It does not start agents. An agent endpoint still comes up from inside the workload via `cli.md` or `sdk.md`, authenticating with a credential this API minted.

## Auth and transport

```bash
curl -X POST https://api.ngrok.com/reserved_addrs \
  -H "Authorization: Bearer $NGROK_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Ngrok-Version: 2" \
  -d '{"description": "..", "region": "us"}'
```

- **API key, not an agent authtoken.** The two are not interchangeable. Keys come from https://dashboard.ngrok.com/api-keys. See `ngrok-setup`.
- **`Ngrok-Version: 2` is required** on every request. Omitting it is the most common first-call failure.
- Every resource also has a CLI form (`ngrok api endpoints create --api-key ..`) and official API clients exist for Go, Python, JavaScript, Rust, and .NET. Prefer the client library in a real codebase; the curl form is here because it maps 1:1 to whatever client the user is on.

## The conventions that matter

Two fields exist on most resources and are easy to waste. Use both, for different readers:

- **`description`** - human-readable, max 255 bytes. This is what someone sees in the dashboard at 2am. Make it identify the specific thing: `"SSH gateway for sandbox web-42 (acct acme)"`, not `"tcp address"`.
- **`metadata`** - machine-readable, max 4096 bytes. Put a JSON string here carrying your own identifiers, so you can reconcile ngrok's state against your database later.

```json
{"tenant_id": "7c9e..", "sandbox_id": "sbx_123", "provider": "e2b", "created_by": "controlplane"}
```

Getting `metadata` right is what makes cleanup, auditing, and orphan detection possible. Without it the only link between an ngrok resource and your object model is a name you have to parse.

**Gotcha: Service Users do not have `description` or `metadata`.** The create body accepts `name` and `active` only, so the name is the only place to carry an identifier. Every other resource in this skill accepts both fields.

## Resources for per-workload provisioning

| Resource | Endpoint | Creates |
| --- | --- | --- |
| Service User | `POST /service_users` | A non-human identity that owns credentials, so tokens are not tied to an employee |
| Credential (agent authtoken) | `POST /credentials` | An authtoken, optionally scoped by ACL and owned by a service user |
| Reserved TCP address | `POST /reserved_addrs` | A stable `host:port` for a public TCP endpoint |
| Reserved domain | `POST /reserved_domains` | A stable hostname for a public HTTP/TLS endpoint |
| Cloud endpoint | `POST /endpoints` | An always-on endpoint carrying a Traffic Policy |
| Vault / Secret | `POST /vaults`, `POST /secrets` | Storage for secrets a policy references via `secrets.get` |

Full request bodies, responses, and the ordering constraints between them are in `api-resources.md`.

Two shapes to know before you write the calls:

**Credential ACLs.** `acl` is a list of `bind:` rules limiting which endpoints a token may create. A token with no ACL can create any endpoint on the account - never hand an unscoped token to code you do not control. See `provision-tenant-access` for how this is the load-bearing security control in a multi-tenant setup.

```json
{"description": "..", "acl": ["bind:tcp://sandbox-7c9e.internal:22"]}
```

**`traffic_policy` is a string, not an object.** On `POST /endpoints` the policy is passed as a serialized YAML or JSON *string*. Nesting it as a real JSON object is a common and confusing failure.

```json
{
  "type": "cloud",
  "bindings": ["public"],
  "url": "tcp://1.tcp.ngrok.io:12345",
  "traffic_policy": "{\"on_tcp_connect\":[{\"actions\":[{\"type\":\"forward-internal\",\"config\":{\"url\":\"tcp://sandbox-7c9e.internal:22\"}}]}]}"
}
```

## Secrets that are returned once

`POST /credentials` returns the `token` field exactly once, on the creation response. It is null on every subsequent read. Write it to wherever it belongs (the sandbox provider's secret store, your vault) in the same code path that creates it. If it is lost, the only recovery is to delete the credential and mint a new one.

Never log the token, never return it in your own API response, and never round-trip it through a chat message.

## Teardown

Resources created per-workload outlive the workload unless you delete them. Reserved addresses and domains in particular keep billing. Delete in reverse dependency order:

1. `DELETE /endpoints/{id}` - the cloud endpoint
2. `DELETE /credentials/{id}` - the authtoken
3. `DELETE /reserved_addrs/{id}` - the address
4. `DELETE /service_users/{id}` - the identity, if it was per-workload

Store each returned `id` against your own object at create time. Then a reconciliation job can list resources, parse `metadata`, and delete anything whose parent no longer exists - which is the payoff for filling `metadata` in properly.

## Errors

Error bodies carry a machine-readable `error_code` (for example `ERR_NGROK_226`) alongside a human `msg`, and `details.operation_id` identifies the request when contacting support. Handle `ERR_NGROK_226` (rate limit, HTTP 429) with backoff - a provisioner creating four resources per sandbox will hit it under a burst. See `troubleshoot-ngrok` for reading codes generally.

## Notes for agents

- If the user is writing a provisioner, hand them idempotency: key off their own identifier, check before create, and make the whole sequence retry-safe. A half-provisioned sandbox is the normal failure, not an exotic one.
- Do not invent fields. If a resource seems to be missing a field the user wants (as with Service User metadata), say so and work around it rather than emitting a body the API will reject.
- API keys and authtokens are different credentials with different blast radii. Do not suggest reusing one for the other.

## Maintainer note

Request bodies, field limits, and resource paths mirror the ngrok API reference at https://ngrok.com/docs/api-reference/. The API reference is the source of truth.
