# Testing Guide

How to run and extend the test suite for the self-hosted tracker.

---

## Test structure

```
self-hosted/
└── tests/
    ├── vitest.config.js
    ├── vitest.setup.js           ← localStorage mock, fetch mock
    ├── unit/
    │   ├── helpers.test.js       ← parse/validate helpers (mirrored from App.jsx)
    │   ├── project-state.test.js ← CRUD, exports, stats
    │   ├── projectLogic.test.js  ← shared commit/validate logic
    │   ├── storage.test.js       ← localStorage, env URL/key helpers
    │   └── server-api.test.js    ← webhook API (supertest)
    ├── security/
    │   └── security.test.js      ← XSS, injection, key exposure
    └── ai/
        ├── prompt-schema.test.js ← live Anthropic calls (optional)
        └── adversarial.test.js
```

---

## Running tests

From `self-hosted/`:

```bash
npm test                  # unit tests only
npm run test:security     # security tests
npm run test:coverage     # coverage report (thresholds in vitest.config.js)
```

Run both fast suites before committing:

```bash
npm test && npm run test:security
```

### AI tests (costs tokens)

```bash
ENABLE_AI_TESTS=true ANTHROPIC_API_KEY=sk-ant-... npm run test:ai
```

AI tests are excluded from default CI on every push. CI runs them on manual trigger or release tags when `ANTHROPIC_API_KEY` is configured.

---

## What each suite covers

### Unit (`tests/unit/`)

| File | Covers |
|---|---|
| `helpers.test.js` | Timestamps, IDs, `detectMissing`, board commit simulation, schema enums |
| `project-state.test.js` | Project list mutations, status transitions, export formats |
| `projectLogic.test.js` | `commitUpdateToProjects`, agent payload validation, status snapshots |
| `storage.test.js` | `getTrackerUrl`, `getAgentKey`, import validation, localStorage round-trip |
| `server-api.test.js` | `POST /api/project-update`, auth, `GET /api/project-status`, `PUT /api/projects` |

### Security (`tests/security/`)

XSS handling, prompt-injection resistance patterns, API key not leaking in exports, malicious handshake sanitization, large input handling.

### AI (`tests/ai/`)

Live prompt output schema compliance and adversarial inputs. Requires `ENABLE_AI_TESTS=true` and an API key.

---

## Manual smoke test (UI + API)

1. `npm run dev` — confirm both `api` and `web` processes start.
2. Open [http://localhost:3000](http://localhost:3000), add a project on **BOARD**.
3. POST a test update:

```bash
curl -X POST http://localhost:3000/api/project-update \
  -H "Content-Type: application/json" \
  -H "X-Agent-Key: dev-agent-key" \
  -d '{"type":"daily","project":"Smoke","summary":"Manual smoke test passed","status":"Active"}'
```

4. Within ~5 seconds the **Smoke** project should appear or update on the board.

---

## CI behaviour

| Trigger | Runs |
|---|---|
| Every push / PR | Unit tests, security tests, build |
| Manual / release tag | + AI prompt tests (if secret set) |

See `.github/workflows/ci.yml`.

---

## Adding tests

**New shared logic:** add to `shared/` and test in `tests/unit/projectLogic.test.js`.

**New API route:** add to `server/index.js` and test in `tests/unit/server-api.test.js` using `createApp()` from the server module.

**New security case:** add to `tests/security/security.test.js` — no live API calls.

**New AI prompt test:** add inside `describeAI` blocks in `tests/ai/` with `ENABLE_AI_TESTS` guard and 30s+ timeout.

---

## Coverage thresholds

Defined in `tests/vitest.config.js`:

| Metric | Minimum |
|---|---|
| Lines | 70% |
| Functions | 70% |
| Branches | 60% |
| Statements | 70% |

HTML report: `coverage/index.html` after `npm run test:coverage`.

---

## GitHub Actions secret

For AI tests in CI: Settings → Secrets → `ANTHROPIC_API_KEY`.

Unit and security tests need no secrets.
