# `close-connection`

**Generated from ngrok's published documentation - do not hand-edit.**

Close a client's connection to ngrok before it is further processed or tunneled to any of your upstream services.

- **Phases:** `on_http_request`, `on_tcp_connect`
- **Ends chain:** yes
- **Categories:** traffic-control

## Configuration

None.

## Example

```yaml
    on_http_request:
    - name: "Immediately close connection"
      expressions:
        - req.url.path.startsWith("/dc")
      actions:
        - type: close-connection

```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/close-connection>
