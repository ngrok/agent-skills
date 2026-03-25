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

## Usage

Skills are automatically available once installed. The agent will use them when relevant tasks are detected.

**Examples:**
```
Expose my app on port 3000 to the internet
```
```
Share my local server with Google OAuth so only people at @mycompany.com can access it
```

## Skill Structure

Each skill contains:
- `SKILL.md` — Instructions for the agent
- `references/` — Supporting documentation (optional)

## License

MIT
