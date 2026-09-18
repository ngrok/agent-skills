# Endpoints: types, bindings, and protocols

Companion to `ngrok-engine`. Endpoint type is a decision the skill makes from the user's intent, not a question to ask them.

Source of truth: <https://ngrok.com/docs/gateway/endpoints/>

## The three types

**Agent endpoint** - created by a running ngrok agent (or SDK process) and lives only as long as that process runs. Fast, zero pre-provisioning. Best for local development, tests, demos, and anything ephemeral.

**Cloud endpoint** - created via the ngrok API/dashboard/IaC and exists independently of any running agent. Always-on, has a stable public URL, survives restarts. Best for production front doors, anything a third party connects to on its own schedule, and setups managed as infrastructure.

**Internal endpoint** - has no public URL. Reachable only from a Traffic Policy `forward-internal` action. This is how you keep a receiver off the public internet: a public endpoint (agent or cloud) verifies/authenticates at the edge, then forwards inward to the internal endpoint.

## Choosing (the decision the skill makes)

- Ephemeral / local / "just give me a URL" -> **agent endpoint**.
- Must stay up when no agent is running, or an external system connects to it on its own (webhook providers, MCP clients, partners) -> **cloud endpoint** as the public front door.
- The receiver must not be publicly reachable (private service, firewall, compliance) -> run it as an **internal endpoint** and put an agent or cloud endpoint in front that forwards to it.

Common composed shape (used by receive-webhooks, test-mcp-server, and provision-sandbox-access): **cloud endpoint (public, runs the policy) -> forward-internal -> internal endpoint -> local service.**

One more axis, orthogonal to the three types: whether the workload set is known ahead of time. If every environment, tenant, or device needs its *own* endpoint and they are created at runtime, the choice above is still cloud-plus-internal - but the provisioning is programmatic. See `provision-sandbox-access`.

## Non-HTTP endpoints

Endpoint type and protocol are separate choices. Any of the three types can carry `http`/`https`, `tls`, or `tcp`, which matters for SSH, RDP, databases, and other raw-TCP services.

What changes for TCP:

- **A public TCP endpoint needs a reserved TCP address to have a stable URL.** Unlike domains, the hostname and port are assigned by ngrok and cannot be chosen; you get something like `1.tcp.ngrok.io:12345`. Reserve one via the API (`provision-sandbox-access`, or `ngrok-surfaces` for the call) or the dashboard. Without one, the address changes every session.
- **Reserved addresses carry a region** (`us`, `eu`, `ap`, `au`, `jp`, `in`, `sa`), chosen at creation and fixed thereafter.
- **A TCP address is only needed for the public binding.** Internal and kubernetes-bound TCP endpoints do not need one.
- **Internal TCP URLs require an explicit port**: `tcp://db.internal:5432`, not `tcp://db.internal`. HTTP internal URLs may omit it.
- **The policy phase is `on_tcp_connect`,** not `on_http_request` - there is no request to inspect, so the connection is the unit. See `traffic-policy.md`.
- **TCP endpoints are not supported by the Kubernetes Operator.** If the user is on the operator and needs TCP, that is a constraint to surface early, not discover late.

Example: SSH on a device, kept off the public internet, fronted by a cloud endpoint on a reserved address.

```yaml
# on the cloud endpoint at tcp://1.tcp.ngrok.io:12345
on_tcp_connect:
  - actions:
      - type: forward-internal
        config:
          url: tcp://device-1.internal:22
```

```yaml
# in the agent's ngrok.yml, on the device
version: 3
endpoints:
  - name: ssh
    url: tcp://device-1.internal:22
    upstream:
      url: 22
```

## Configuring

The concrete commands, manifests, and code differ by surface. All of it lives in `ngrok-surfaces`, which routes from the user's project:
- agent endpoints and internal bindings -> the agent CLI, or an SDK for in-process
- cloud endpoints declared as infrastructure -> Terraform or the Kubernetes operator
- cloud endpoints created at runtime, one per tenant or workload -> the REST API

What every surface shares:
- An internal endpoint is bound as internal (it gets an `.internal` URL and no public address).
- A `forward-internal` policy action targets that internal URL (see `traffic-policy.md`).
- A cloud endpoint carries a Traffic Policy that runs whether or not any agent is connected.
