# Installation Guide

How to install and run the AI Project Tracker — Claude Artifact (zero setup) or self-hosted (local API + UI).

---

## Prerequisites

### Software
- **Node.js 18+** (CI uses Node 24)
- **npm** (bundled with Node.js)

### Accounts
- **Anthropic API key** — required for self-hosted AI features ([console.anthropic.com/keys](https://console.anthropic.com/keys))
- **Claude.ai subscription** — optional, only for the Artifact path

---

## Option A: Claude Artifact (no install)

1. Open [claude.ai](https://claude.ai).
2. Copy `claude-artifact/App.jsx` from this repository.
3. Ask Claude to render it as a React artifact.

Runs immediately — no API key, no backend. Data is in-memory in the artifact session only.

---

## Option B: Self-hosted

### 1. Clone and install

```bash
git clone https://github.com/trevorseitz-ai/ai-project-tracker.git
cd ai-project-tracker/self-hosted
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```plaintext
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
VITE_TRACKER_URL=http://localhost:3000/api/project-update
VITE_AGENT_KEY=dev-agent-key
```

| Variable | Purpose |
|---|---|
| `VITE_ANTHROPIC_API_KEY` | AI parse, prep, reporter generation (browser) |
| `VITE_TRACKER_URL` | Injected into handshake files and generated scripts |
| `VITE_AGENT_KEY` | Must match server; used in `X-Agent-Key` header |

### 3. Run (development)

```bash
npm run dev
```

| Process | Port | Role |
|---|---|---|
| Vite (web) | 3000 | React UI — open this in your browser |
| Express (api) | 3001 | Webhook API — proxied via `/api` in dev |

### 4. Run (production)

```bash
npm run build
npm start
```

Serves the built UI and API on port **3000** (override with `PORT`).

### 5. First project

See [Your First Project](./FIRST_PROJECT.md).

---

## npm scripts

| Script | Description |
|---|---|
| `npm run dev` | API + UI together (recommended) |
| `npm run dev:client` | UI only — no webhook API |
| `npm run dev:server` | API only |
| `npm run build` | Production frontend build |
| `npm start` | Production server (UI + API) |
| `npm test` | Unit tests |
| `npm run test:security` | Security tests |

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Node version errors | Use Node 18+ (`node -v`) |
| `npm install` fails | `npm cache clean --force` then retry |
| AI buttons fail | Check `VITE_ANTHROPIC_API_KEY`, restart dev server |
| Agent POST 401 | Match `X-Agent-Key` to `VITE_AGENT_KEY` in `.env` |
| Board doesn't sync | Run `npm run dev`, not `dev:client` alone |

See [Troubleshooting Guide](./TROUBLESHOOTING.md).

---

Next: [Your First Project](./FIRST_PROJECT.md) → [Workflows](./WORKFLOWS.md)
