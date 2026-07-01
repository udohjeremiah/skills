# Skills

A collection of [Agent Skills](https://agentskills.io) — reusable, portable
capabilities for AI coding agents like Claude Code, Cursor, Codex, and others.

## What is a Skill?

A skill is a folder containing a `SKILL.md` file
(YAML frontmatter + instructions), plus optional scripts, references, and
assets. Agents load skills on demand, giving them domain-specific expertise
without bloating context.

```text
skill-name/
├── SKILL.md # required: name, description, instructions
├── scripts/ # optional: executable code
├── references/ # optional: docs
└── assets/ # optional: templates, resources
```

## Origin and standard

Skills originated at Anthropic as an internal mechanism for Claude Code, then
were published as an open standard (Apache 2.0 / CC-BY-4.0) at
[agentskills.io](https://agentskills.io) in December 2025. The format is now
supported natively across Claude Code, Codex CLI, Gemini CLI, GitHub Copilot,
Cursor, and more.

For the full spec, see
[agentskills.io/specification](https://agentskills.io/specification).

## Using a Skill

Once installed, you don't invoke a skill directly — just describe what you want,
and the agent decides whether to load it based on its `description`. For
example, if you have the `pdf` skill installed, asking
"extract the text from this PDF" is enough to trigger it.

All commands below use the [skills CLI](https://skills.sh) (`npx skills`), which
supports Claude Code, Cursor, Codex, and 60+ other agents.

## Install

```bash
# Interactive — pick which skill(s) and agent(s) to install
npx skills add udohjeremiah/skills

# List all skills in this repo without installing
npx skills add udohjeremiah/skills --list

# Install a specific skill
npx skills add udohjeremiah/skills --skill <skill-name>

# Install multiple specific skills
npx skills add udohjeremiah/skills --skill <skill-a> --skill <skill-b>

# Install all skills in this repo
npx skills add udohjeremiah/skills --all

# Install to a specific agent (e.g. claude-code, cursor, codex)
npx skills add udohjeremiah/skills --skill <skill-name> -a claude-code

# Install globally (available across all your projects, not just this one)
npx skills add udohjeremiah/skills --skill <skill-name> -g

# Non-interactive install (skip prompts, e.g. for CI/CD)
npx skills add udohjeremiah/skills --skill <skill-name> -y
```

## Use without installing

Generate a prompt for a skill, or run it directly through a supported agent.

```bash
# Interactive — pick the skill and agent
npx skills use udohjeremiah/skills

# Print the generated prompt to stdout
npx skills use udohjeremiah/skills --skill <skill-name>

# Pipe straight into an agent
npx skills use udohjeremiah/skills@<skill-name> | claude

# Start a specific agent interactively with the skill loaded
npx skills use udohjeremiah/skills --skill <skill-name> --agent claude-code
```

## List installed skills

```bash
# List all installed skills (project + global)
npx skills list

# List only global skills
npx skills list -g

# Filter by agent
npx skills list -a claude-code -a cursor
```

## Update

```bash
# Update all installed skills (interactive scope prompt)
npx skills update

# Update a specific skill
npx skills update <skill-name>

# Update multiple specific skills
npx skills update <skill-a> <skill-b>

# Update only global or only project skills
npx skills update -g
npx skills update -p

# Non-interactive update
npx skills update -y
```

## Remove

```bash
# Interactive — pick which installed skill(s) to remove
npx skills remove

# Remove a specific skill
npx skills remove <skill-name>

# Remove multiple skills
npx skills remove <skill-a> <skill-b>

# Remove from global scope
npx skills remove --global <skill-name>

# Remove from a specific agent only
npx skills remove --agent claude-code <skill-name>

# Remove all skills from a specific agent
npx skills remove --skill '*' -a cursor

# Remove all installed skills without confirmation
npx skills remove --all
```

## Skills in this repo

| Skill | Description |
| ----- | ----------- |
|       |             |
