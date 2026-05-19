# Changelog

All notable changes to AI Project Tracker are documented here.

---

## [1.0.0] — Initial Release

### Added

**Core Tracker**
- Project status board with Active / Blocked / Stalled / Complete states
- Update timeline per project with expandable log view
- Manual status overrides from the board
- Stats bar: project count, total updates, blocked count

**Log Update Tab**
- Paste raw AI output from any source (ChatGPT, Gemini, Claude, etc.)
- Claude parses the update, classifies type, extracts blockers and next steps
- Confidence scoring with visual meter
- Gap detection — flags missing or low-confidence fields before commit
- Editable parsed fields before committing to the board
- All updates auto-routed to the correct project (creates project if new)

**Reporter Tab**
- **Push Mode**: tracker knows the project, generates a pre-configured Python reporter with all config hardcoded — droppable into any agent with zero setup
- **Pull Mode (Autonomous)**: generates a self-discovering reporter that scans README, git log, package.json, requirements.txt, and TODO files to build context without being told anything
- **Pull Mode (Human Interview)**: live conversational intake — asks one question at a time, builds first update from answers, auto-logs to board when done
- Reporter schema reference and copyable system prompt for ChatGPT, Gemini, Copilot

**Prep Agent Tab**
- Compliance audit across 6 categories: Identity, Documentation, Version Control, Stack Legibility, Status Clarity, Reporter Readiness
- Scored audit report (0–100 per category + overall)
- Automated fixes list (applied by prep script) and manual actions list (requires human/agent)
- Generates `.tracker-config.json` handshake file — the contract between project and reporter
- Generates Python prep script with four labeled sections: AUDIT, REMEDIATE, HANDSHAKE, REPORT
- Non-destructive — never overwrites existing files
- Compliance update auto-logged to board on completion

**Agent API Tab**
- Webhook endpoint format spec for autonomous agents to POST updates
- Agent system prompt snippet for embedding reporting into any agent
- Polling / status check spec so agents can pause when a project is Blocked
- JSON and Markdown export of all project data

### Architecture
- Push/Pull/Prep agent model — reporters are pushed with full context OR pulled to discover context autonomously
- `.tracker-config.json` handshake pattern — prep agent writes it, reporter reads it on arrival
- Works with autonomous agents (headless) and human-in-loop projects equally
- All AI calls use `claude-sonnet-4-20250514`

### Versions
- `claude-artifact/App.jsx` — runs inside claude.ai, no API key needed
- `self-hosted/` — full Vite/React app, requires `VITE_ANTHROPIC_API_KEY`
