# ngrok error codes reference

High-frequency codes with cause and fix. Always work from the code when present.

## ERR_NGROK_3200 - endpoint offline
The URL is visited but no agent is currently serving it. Causes: agent not running; agent running a different URL/endpoint than the one visited; reserved domain not bound by the running agent.
Fix: confirm the agent is up; confirm the URL it serves matches the one being visited; for reserved domains confirm the binding.
Note: often shown to *visitors* of a tunnel whose owner's agent stopped - in that case there is nothing for the visitor to fix.

## ERR_NGROK_8012 - upstream connection refused
Agent is up but the local upstream refused / nothing is listening on the forwarded port.
Fix: start the local service; confirm it listens on exactly the port the endpoint forwards to; confirm host/scheme (http vs https) match.

## Auth / authentication required
Missing or invalid authtoken (agent) or API key (IaC).
Fix: see the ngrok-setup skill. For the agent: `ngrok config add-authtoken <TOKEN>` or set NGROK_AUTHTOKEN.

## Traffic Policy errors
Malformed YAML, unknown action type, or invalid CEL expression.
Fix: validate against the traffic-policy skill; confirm action names/config keys; check expressions. A policy silently having no effect usually means it isn't attached to the endpoint being hit - confirm attachment per the surface skill.

## Host-header / rejected-through-URL (symptom, may have no single code)
Works locally, 400/rejected via the public URL. Dev servers and internal-forwarded services reject an unexpected Host.
Fix: set the framework's allowed-hosts to the ngrok domain, or rewrite the host header (--host-header=rewrite for internal forwarding; see expose-localhost's TROUBLESHOOTING.md / test-mcp-server).

## Others
Session/endpoint limits, TLS/cert issues, DNS or reserved-domain problems each have their own ERR_NGROK code. For any code not listed here, read the code's meaning from ngrok's error-code docs and match cause->fix the same way.
