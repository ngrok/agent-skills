---
name: daily-briefing
description: Personalized daily briefing from connected tools (Google Calendar, Gmail, Slack, Linear). If already configured, runs the briefing immediately. If not, interviews the user to set up their config first. Use when asked for a daily briefing, morning briefing, daily standup prep, or daily digest.
license: MIT
metadata:
  author: ngrok
  version: "1.0"
compatibility: Requires at least one connected tool (Google Calendar, Gmail, Slack, or Linear).
---

# Daily Briefing

Pulls from connected tools and produces a structured morning briefing personalized to the user.

## Entry Point

Check if a config file exists at `briefing-config.md` in this skill directory.

- **Config exists**: Skip to **Run the Briefing**.
- **No config**: Start with **Setup** below.

If the user explicitly asks to reconfigure (e.g., "update my briefing config", "change my briefing settings"), go to Setup even if a config exists — offer to edit the existing config rather than starting from scratch.

---

## Setup

### Pre-fill what you can

Before asking the user anything, silently gather what you can from the environment:

- **Email**: Check git config (`git config user.email`), or context provided by the system.
- **Timezone**: Run `date +%Z` or check system timezone.
- **Connected tools**: Probe each tool (Calendar, Gmail, Slack, Linear) with a lightweight call to see which ones respond. Note which are available.
- **Slack user ID**: If Slack is connected, look up the user by email.
- **Name**: From git config or Slack profile.

Carry these into the interview as defaults the user can confirm or override.

### Interview

This is a conversation, not a form. Ask **one question at a time**. Wait for the answer before asking the next. Build on what they tell you — if their answer to one question covers a later one, skip it. If they volunteer extra context, incorporate it.

The goal is to fill out the config template. The topics below are what you need to cover, not a script to read verbatim. Adapt the phrasing to what the user has already told you.

**Start with what you found:**

> I picked up a few things from your environment — [name] at [company], [timezone], email [email]. That look right? And what do people call you on Slack?

Then work through these topics in whatever order feels natural:

**Who they are**: Name/aliases, email, Slack user ID, company, timezone, domains to watch. Lead with what you already know and ask them to confirm or correct.

**What they do**: Title/role, what they own, manager, key stakeholders.

**What to track**: Projects they own vs. ones they just need awareness of. Slack channels (must-read vs. background). Linear projects/teams.

**What matters**: What makes something urgent to them. What to always flag. What to always skip. Patterns to watch for (quiet threads, converging topics, no focus time).

**How the briefing should read**: Just summaries or connect-the-dots analysis? Draft replies? Include a "what shipped" section? Tone — sharp chief of staff, neutral assistant, something else?

**Connected tools**: Confirm what you detected. For anything that didn't respond, mention it and say you'll skip those sections.

After each answer, briefly confirm what you captured before moving on. If the user says "skip" or seems done with a topic, move on — use sensible defaults for anything they didn't specify.

### Save the Config

After the interview, assemble the answers into a briefing configuration file. Save it to `briefing-config.md` in this skill directory.

Use the template at `templates/briefing-config.md` in this skill directory as the structure. Fill in the user's answers. For any section the user skipped, either omit or use the default from the template.

Show the user the assembled config and ask them to confirm or adjust anything before proceeding.

### Delivery Choice

After saving the config, ask how they want to use it — on demand, or on a schedule?

If **on demand**: Done. Tell the user they can ask for their briefing anytime and this skill will run it.

If **scheduled**: Ask for time, days, and destination, then use the `schedule` skill (invoke `/schedule`) to create a cron trigger. Store the delivery preferences in the config's Delivery section.

---

## Run the Briefing

When a config exists, execute the briefing:

1. Read the config from `briefing-config.md` in this skill directory.
2. Read the execution template from `templates/briefing-execution.md` in this skill directory.
3. Substitute the user's config values into the template.
4. Execute each section — pull from the connected tools listed in the config, skip tools that aren't connected.
5. Present the briefing to the user.

## Important Notes

- **One question at a time.** Never dump a numbered list of questions. This is a conversation. Wait for an answer, then ask the next thing.
- **Infer before asking.** If you can get it from the environment or a tool, pre-fill it and confirm. Don't ask the user to type what you can look up.
- **Build on answers.** If they mention their manager while describing their role, don't re-ask about their manager later.
- If a tool isn't connected (e.g., Linear auth fails), note it and skip that section — don't block the whole briefing.
- The config file is the single source of truth. The `templates/briefing-execution.md` template contains the briefing structure and intelligence (connecting dots, flagging quiet threads, drafting replies, etc.) — it is read at execution time, never duplicated elsewhere.
