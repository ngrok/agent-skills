# Worked example: SSH into ephemeral sandbox containers

Companion to `provision-tenant-access`. The case: a controlplane spins up sandbox
containers on a provider (e2b, Daytona, Modal, Fly, a self-hosted runner) and each
sandbox must be SSH-reachable without a public IP and without the sandboxes being
able to reach each other.

Throughout, `<uuid>` is the identifier the controlplane already uses for the object
that owns the sandbox. Every name, ACL rule, and internal URL is derived from it.

## Controlplane: provision before the sandbox boots

The sequence, with full request bodies in `ngrok-surfaces/references/api-resources.md`:

```
1. POST /service_users     name = "sandbox <uuid>"
                           -> service_user_id

2. POST /reserved_addrs    region = "us"
                           description = "SSH for sandbox <uuid>"
                           metadata = {"sandbox_id": "<uuid>"}
                           -> addr  (e.g. "1.tcp.ngrok.io:12345")

3. POST /credentials       acl = ["bind:tcp://sandbox-<uuid>.internal:22"]
                           owner_id = service_user_id
                           description = "Agent authtoken for sandbox <uuid>"
                           metadata = {"sandbox_id": "<uuid>"}
                           -> token  (returned once)

4. POST /endpoints         type = "cloud", bindings = ["public"]
                           url = "tcp://{addr}"
                           traffic_policy = <policy below, serialized>
                           -> endpoint_id

5. provider API            store `token` as a sandbox secret
```

The policy on the cloud endpoint:

```yaml
on_tcp_connect:
  - actions:
      - type: forward-internal
        config:
          url: tcp://sandbox-<uuid>.internal:22
```

Persist `service_user_id`, the reserved address `id`, the credential `id`, and
`endpoint_id` on your sandbox record. They are what teardown and reconciliation need.

Steps 1-4 are four API calls that can each fail. Key the whole sequence on `<uuid>`,
check-before-create, and make it safe to re-run.

## Sandbox: bring up the agent

Environment, from the provider's secret store rather than the image:

```
NGROK_AUTHTOKEN=<the token from step 3>
```

Download the agent for the container's architecture:

```bash
ARCH="$(uname -m)"
case "$ARCH" in
  x86_64)  NGROK_ARCH=amd64 ;;
  aarch64) NGROK_ARCH=arm64 ;;
  *) echo "unsupported arch: $ARCH" >&2; exit 1 ;;
esac

curl -sSfL "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-${NGROK_ARCH}.tgz" \
  | tar -xz -C /usr/local/bin ngrok
```

Config at `/etc/ngrok.yml`:

```yaml
version: 3
endpoints:
  - name: ssh
    # must match the cloud endpoint's forward-internal target and the ACL bind rule
    url: tcp://sandbox-<uuid>.internal:22
    upstream:
      url: 22
```

No `agent.authtoken` key - the agent reads `NGROK_AUTHTOKEN` from the environment, so
the token never lands on disk.

Start it:

```bash
ngrok start --all --config /etc/ngrok.yml
```

To survive restarts, register the agent as a native OS service instead (systemd on
Linux). Note that `install` only registers it - `start` is a separate command, and
both usually need root:

```bash
ngrok service install --config /etc/ngrok.yml
ngrok service start
```

Prefer the foreground form for a first implementation: when the internal URL is
wrong, a foreground agent tells you immediately, and a service hides it in syslog.

## Connect

```bash
ssh -p 12345 user@1.tcp.ngrok.io
```

Host and port are the `addr` from step 2. Nothing about the sandbox's location or
network leaks to the client, and the sandbox has no inbound ports open.

## Why the sandbox cannot escape

Sandboxes run untrusted code, so assume the token leaks. With
`acl: ["bind:tcp://sandbox-<uuid>.internal:22"]`, a stolen token can only bind an
endpoint the attacker already controls. It cannot bind another sandbox's internal
hostname, cannot create a public endpoint, and cannot reach the API - credentials are
agent authtokens, not API keys.

The token is also per-sandbox, so revoking it (`DELETE /credentials/{id}`) cuts off
exactly one workload.

Internal endpoints are not addressable from each other by default - traffic reaches
them only through a `forward-internal` from an endpoint that names them. Sandbox A
cannot dial `tcp://sandbox-B.internal:22`.

## Teardown

When the sandbox is destroyed:

```
DELETE /endpoints/{endpoint_id}
DELETE /credentials/{credential_id}
DELETE /reserved_addrs/{addr_id}
DELETE /service_users/{service_user_id}
```

Reserved TCP addresses bill until deleted, so a leak here is a line item. Back the
per-sandbox deletes with a reconciliation job that lists resources, reads `metadata`,
and removes any whose sandbox no longer exists.

## Later: embedding the agent instead of shipping the binary

If the sandbox already runs a process you control (a metrics daemon, a supervisor),
the endpoint can move into that process through an ngrok SDK - one less binary to
download, one less process to supervise, and the endpoint's lifetime becomes exactly
the daemon's.

Tradeoffs to weigh before doing it:

- **Debuggability gets worse first.** A misconfigured URL surfaces as agent log output
  today; embedded, it surfaces as an SDK error inside your process. Ship the binary,
  confirm the path end to end, then move it.
- **Restart semantics change.** The endpoint dies with the daemon. That is usually
  desirable, but it couples sandbox reachability to that process's health.
- **Upgrades change shape.** The agent binary can be re-downloaded independently; an
  embedded SDK ships when the daemon ships.
- **Confirm internal-binding support in the SDK and version in use** before committing.
  The internal endpoint (`.internal` URL) is the part to verify - public TCP endpoints
  are well covered in every SDK, internal bindings less uniformly so. Check the crate
  or package docs for the exact builder call rather than assuming it mirrors the agent
  config, and verify against the version in the project's lockfile.

See `ngrok-surfaces` for the per-language SDK surface. Do not port the agent config to SDK calls
from memory - the shapes differ, and a wrong endpoint URL fails in a way that looks
like a network problem.

## Maintainer note

Agent config keys, API bodies, and the ACL semantics mirror ngrok's published docs and
are. The agent download URL and the SDK builder calls
are the two things most likely to drift - verify both before publishing.
