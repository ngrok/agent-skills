# Agent SDKs (Go, JavaScript, Python, Rust)

Source of truth: <https://ngrok.com/docs/agent-sdks/> and each SDK's own docs.

For embedding ngrok in a running program. The endpoint comes up when the app starts
and dies with it - no separate agent process to install or supervise.

Authenticate with an agent **authtoken**, normally from `NGROK_AUTHTOKEN`.

The Traffic Policy body is identical to every other surface: pass the same YAML as a
string (or a file path, where the SDK supports it).

## Pattern, same across languages

1. Import the SDK.
2. Start a listener or forwarder against your local port or handler.
3. Supply the authtoken, usually from the environment.
4. Attach the Traffic Policy.
5. For a private receiver, give it a `.internal` URL.

## Detecting the surface

`package.json` with `@ngrok/ngrok`, a `pyproject.toml`/import of `ngrok`, a `go.mod`
with `golang.ngrok.com/ngrok/v2`, or a `Cargo.toml` with the `ngrok` crate.

## JavaScript / TypeScript

Verified against ngrok's JavaScript quickstart.

```javascript
const ngrok = require("@ngrok/ngrok");

const listener = await ngrok.forward({
  addr: 8080,
  authtoken_from_env: true,
  // a policy string, or a path to a policy file
  traffic_policy: '{"on_http_request":[{"actions":[{"type":"oauth","config":{"provider":"google"}}]}]}',
});
console.log(`Ingress established at ${listener.url()}`);
```

Docs: <https://ngrok.github.io/ngrok-javascript/>

## Python

Verified against ngrok-python's README, which documents `traffic_policy` as a
keyword argument alongside `authtoken_from_env` and `proto`.

```python
import ngrok

listener = ngrok.forward(
    "localhost:8080",
    authtoken_from_env=True,
    traffic_policy=open("policy.yaml").read(),
)
print(f"Ingress established at: {listener.url()}")
```

Docs: <https://ngrok.github.io/ngrok-python/>

## Go

Module `golang.ngrok.com/ngrok/v2`.

```go
import (
    "context"

    "golang.ngrok.com/ngrok/v2"
)

// Listen: you accept connections yourself.
ln, err := ngrok.Listen(ctx, ngrok.WithTrafficPolicy(policyYAML))

// Forward: ngrok proxies to an upstream for you.
fwd, err := ngrok.Forward(ctx,
    ngrok.WithUpstream("http://localhost:8080"),
    ngrok.WithURL("https://my-app.ngrok.app"),
)
```

`ngrok.Listen(ctx)` reads `NGROK_AUTHTOKEN` from the environment on its own. To pass
one explicitly, build an agent with `ngrok.NewAgent(ngrok.WithAuthtoken(token))`.

**Do not use `config.HTTPEndpoint(..)` or `ngrok.WithAuthtokenFromEnv()`.** Both are
from the legacy v1 API - the former is no longer public and returns a type
`ngrok.Listen` will not accept, so code using them does not compile. This was a real
dead end in an earlier version of these skills; see `papercuts.md`.

Docs: <https://pkg.go.dev/golang.ngrok.com/ngrok/v2>

## Rust

Verified against ngrok-rust: `traffic_policy(policy_str)` is a builder method on
the endpoint config (`ngrok/src/config/http.rs`). Note the crate also has an older
`policy()` method that is deprecated in favour of it.

```rust
use ngrok::prelude::*;

let listener = ngrok::Session::builder()
    .authtoken_from_env()
    .connect()
    .await?
    .http_endpoint()
    .traffic_policy(policy_yaml)
    .listen()
    .await?;
```

For a TCP endpoint on a reserved address, the documented form is
`session.tcp_endpoint().remote_addr("1.tcp.ngrok.io:12345").listen()`.

Docs: <https://docs.rs/ngrok/latest/ngrok/>

## Notes for agents

- The policy file is shared. The same `policy.yaml` works from the CLI, IaC, and an
  SDK - do not rewrite it when moving surfaces.
- Check the project's lockfile for the SDK version before emitting code. These SDKs
  version independently of each other and of the agent.
- Check the project's lockfile before emitting code. A wrong method name fails at
  compile time if you are lucky and at runtime if you are not.

## Maintainer note

Per-language method names and option keys drift independently. All four languages here were verified against their current SDK sources: the
JavaScript quickstart, ngrok-python's README, `golang.ngrok.com/ngrok/v2`, and
ngrok-rust's endpoint config. Re-verify on SDK releases - they version
independently of each other and of the agent.
