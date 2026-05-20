# Code Architecture

How the self-hosted AI Project Tracker is built today — a React UI, an Express API, and shared logic for project updates.

---

## High-level overview

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (localhost:3000)                                    │
│  ┌─────────────┐   Anthropic API    ┌─────────────────────┐ │
│  │  App.jsx    │ ─────────────────► │ Parse / Prep /      │ │
│  │  5 tabs     │   (VITE_ANTHROPIC) │ Reporter generation │ │
│  └──────┬──────┘                    └─────────────────────┘ │
│         │ fetch /api/*                                       │
└─────────┼───────────────────────────────────────────────────┘
          │ Vite proxy (dev) or same origin (prod)
          ▼
┌─────────────────────────────────────────────────────────────┐
│  Express API (server/index.js)                               │
│  POST /api/project-update  ← autonomous agents               │
│  GET/PUT /api/projects     ← UI sync                         │
└──────────┬──────────────────────────────────────────────────┘
           ▼
    data/projects.json
```

**Prep / Push / Pull** are not separate CLI modules. They are AI prompts in `App.jsx` that generate JSON, scripts, and handshake files you copy into external projects.

---

## Repository layout

```
ai-project-tracker/
├── claude-artifact/
│   └── App.jsx                 ← paste into claude.ai (no backend)
├── self-hosted/
│   ├── src/
│   │   ├── App.jsx             ← entire React UI + Anthropic calls
│   │   ├── main.jsx
│   │   ├── storage.js          ← localStorage + env helpers
│   │   └── api.js              ← fetch wrappers for /api/*
│   ├── server/
│   │   ├── index.js            ← Express app + routes
│   │   └── fileStorage.js      ← reads/writes data/projects.json
│   ├── shared/
│   │   ├── projectLogic.js     ← commit update, validate agent payload
│   │   └── projectsSchema.js   ← project/update validation
│   ├── data/                   ← gitignored; server persistence
│   ├── tests/                  ← Vitest (unit, security, ai)
│   ├── vite.config.js          ← dev proxy /api → :3001
│   └── .env.example
└── docs/
```

---

## UI tabs (`App.jsx`)

| Tab | Role |
|---|---|
| **BOARD** | Project cards, status, update history |
| **LOG UPDATE** | Paste text → AI parse → commit |
| **REPORTER** | Generate Push/Pull scripts or copy schema prompt |
| **PREP AGENT** | Compliance audit + `.tracker-config.json` + prep script |
| **AGENT API** | Live webhook spec, export/import JSON |

---

## Data flow

### Human-in-the-loop

1. User pastes or commits an update in the UI.
2. `commitUpdateToProjects()` merges it into state (`shared/projectLogic.js`).
3. React state saves to `localStorage` and syncs to server via `PUT /api/projects`.
4. Server writes `data/projects.json`.

### Autonomous agent

1. Agent POSTs to `/api/project-update` with `X-Agent-Key`.
2. Server validates payload, merges update, writes `projects.json`.
3. UI polls `GET /api/projects` every 5s and refreshes the board.

### External project scripts

1. User runs Prep/Push/Pull in the UI → copies generated Python script + handshake JSON.
2. User saves files into their **external** repo (the tracker does not write to disk remotely).
3. Script runs in that repo and POSTs updates back to `VITE_TRACKER_URL`.

---

## Key modules

| Module | Purpose |
|---|---|
| `shared/projectLogic.js` | Shared merge/validate logic for UI and server |
| `shared/projectsSchema.js` | `isValidProject`, import normalization |
| `src/storage.js` | Browser persistence, tracker URL, agent key from env |
| `server/index.js` | HTTP routes, agent key check |
| `server/fileStorage.js` | JSON file CRUD |

---

## Development vs production

| | Development | Production |
|---|---|---|
| **Start** | `npm run dev` | `npm run build && npm start` |
| **UI** | Vite `:3000` | Express serves `dist/` |
| **API** | Express `:3001`, proxied | Same process as UI |
| **Env** | `self-hosted/.env` | Set env vars on host |

---

## Generated artifacts (external repos)

| Artifact | Produced by | Used by |
|---|---|---|
| `.tracker-config.json` | Prep Agent tab | Reporter scripts on arrival |
| `reporter.py` (or similar) | Push/Pull tabs | Host agent, calls `POST /api/project-update` |
| Prep Python script | Prep Agent tab | Optional automated fixes in target repo |

These are **copied from the UI**, not written automatically into other directories.

---

## Extending the codebase

**New API route:** add handler in `server/index.js`, test in `tests/unit/server-api.test.js`.

**New UI feature:** edit `App.jsx` (monolith today) or extract components as the app grows.

**Shared business logic:** put pure functions in `shared/` so both client and server can import them.

---

## Technologies

- **React 18** + **Vite** — frontend
- **Express** — webhook API and production static hosting
- **Anthropic API** — parse, prep, reporter generation (browser-side)
- **Vitest** — tests
- **JSON file** — server persistence (`data/projects.json`)

---

See [API Reference](./API_REFERENCE.md), [Testing](./TESTING.md), and [Roadmap](./ROADMAP.md) for integration details and planned work.
