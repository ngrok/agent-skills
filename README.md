# ngrok Agent Skills

A collection of skills for AI coding agents. Skills are packaged instructions that extend agent capabilities.

Skills follow the [Agent Skills](https://agentskills.io/) format.

## Installation

```bash
npx skills add ngrok/agent-skills
```

## Available Skills

### expose-localhost

Expose a local service to the public internet using ngrok. Optionally add OAuth, OWASP protection, or rate limiting via Traffic Policy.

**Use when:**
- "Expose my local server"
- "Make my app publicly accessible"
- "Create a tunnel to localhost"
- "Share my local service with a coworker"

**Features:**
- One-command tunnel via `ngrok http`
- Optional OAuth authentication (Google, GitHub, Microsoft, GitLab, LinkedIn, Twitch)
- Optional OWASP Core Rule Set protection
- Optional rate limiting
- Email/domain-based access restriction

### front-door-auth

Add OAuth to a service without writing OAuth code. ngrok runs as an auth-aware front door: a public cloud endpoint runs OAuth and forwards to a private internal endpoint backing your app, which reads two trusted identity headers.

**Use when:**
- "Add OAuth to my app without writing OAuth code"
- "Delegate auth to ngrok"
- "Use ngrok as an auth-aware API gateway"
- "Set up auth at the edge"
- "Front-door pattern"

**Features:**
- Generates `traffic-policy.yml` (OAuth + add-headers + forward-internal) and `ngrok.yml` (internal endpoint).
- Drops trusted-header middleware into the project for Hono, Express, Fastify, Next.js, FastAPI, or Flask.
- Creates the cloud endpoint via `ngrok api endpoints create` and starts the agent.
- Optional email or domain allowlist enforced at the gateway.

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
Add Google OAuth to my Hono app without writing any auth code
```

## Skill Structure

Each skill contains:
- `SKILL.md` — Instructions for the agent
- `references/` — Supporting documentation (optional)

## License

MIT
