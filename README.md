# ngrok Agent Skills

A collection of skills for AI coding agents. Skills are packaged instructions that extend agent capabilities.

Skills follow the [Agent Skills](https://agentskills.io/) format.

## Installation

```bash
# everything
npx skills add ngrok/agent-skills

# or just what you need
npx skills add ngrok/agent-skills --skill expose-localhost
```

## Available Skills

### expose-localhost

Give a local service a public URL. HTTP, or raw TCP for SSH, RDP, and databases.

**Use when:**
- "Expose my local server"
- "Make my app publicly accessible"
- "Share my local service with a coworker"
- "Let my client preview my dev site, but not the whole internet"
- "SSH into a box with no public IP"

### secure-endpoint

Put authentication, rate limiting, IP rules, or a custom response in front of an endpoint — without touching application code.

**Use when:**
- "Require Google login on my ngrok URL"
- "Only allow my office IP range"
- "Rate limit my API"
- "Put up a maintenance page"

### receive-webhooks

Receive webhooks from Stripe, GitHub, and 70+ other providers, with signature verification at the edge. Can keep the receiver off the public internet entirely.

**Use when:**
- "Test Stripe webhooks locally"
- "Receive GitHub webhooks in production"
- "One endpoint for webhooks from several providers"

### test-mcp-server

Expose an MCP server you are developing so Claude, OpenAI, or another provider can connect to it, each with its own credential.

**Use when:**
- "Let Claude connect to my local MCP server"
- "Test my MCP server against a real client"

### provision-sandbox-access

Give every sandbox, container, customer device, or tenant its own isolated endpoint, provisioned programmatically from a controlplane.

**Use when:**
- "Each sandbox needs its own SSH access"
- "One endpoint per customer"
- "Provision ngrok from our controlplane"

### troubleshoot-ngrok

Diagnose ngrok errors and the failures that look like ngrok's fault but aren't.

**Use when:**
- "What does ERR_NGROK_3200 mean?"
- "Works on localhost, 400 through the ngrok URL"
- "My endpoint is offline"

### ngrok-setup

Get authenticated and pointed at the right surface — CLI, SDK, API, or infrastructure-as-code.

**Use when:**
- "Set up ngrok"
- "ngrok says I'm not authenticated"

## Supporting References

Two skills are reference material rather than tasks. The skills above load them automatically; you do not invoke them directly, but they are installed as part of the set.

| Skill | Covers |
| --- | --- |
| `ngrok-engine` | Endpoint types (agent, cloud, internal), HTTP vs TCP, and Traffic Policy — the rule language, plus a reference for all 26 actions. |
| `ngrok-surfaces` | How to apply configuration on each surface: agent CLI and `ngrok.yml`, the Go/JavaScript/Python/Rust SDKs, the REST API, Terraform, and the Kubernetes Operator. |

## Usage

Skills are automatically available once installed. The agent will use them when relevant tasks are detected.

**Examples:**
```
Expose my app on port 3000 to the internet
```
```
Share my local server with Google OAuth so only people at @mycompany.com can access it
```
```
Receive Stripe webhooks and deliver them to a service that isn't publicly reachable
```

## Skill Structure

Each skill contains:
- `SKILL.md` — Instructions for the agent
- `references/` — Supporting documentation (optional)

## License

MIT
