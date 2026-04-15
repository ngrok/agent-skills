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

### daily-briefing

Personalized daily briefing from connected tools. Interviews you once to learn your role, projects, and preferences, then produces a structured morning briefing on demand or on a schedule.

**Use when:**
- "Give me my daily briefing"
- "Set up a morning briefing"
- "What do I need to know today?"
- "Prep me for my day"

**Features:**
- Conversational setup — infers what it can from your environment, asks the rest one question at a time
- Pulls from Google Calendar, Gmail, Slack, and Linear (skips tools that aren't connected)
- Connects dots across tools — flags quiet threads, calendar conflicts, related conversations
- Configurable tone, analysis depth, and what to always flag or skip
- On-demand or scheduled delivery

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
