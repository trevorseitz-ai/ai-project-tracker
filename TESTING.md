# Testing Guide

This document explains the test suite structure, what each test covers, and how to run them.

---

## Test Structure

```
self-hosted/
└── tests/
    ├── vitest.config.js          ← Vitest configuration
    ├── vitest.setup.js           ← Global mocks and browser API stubs
    ├── unit/
    │   ├── helpers.test.js       ← Pure functions: TS(), uid(), detectMissing(), commitToBoard()
    │   └── project-state.test.js ← Project CRUD, status transitions, exports, stats
    ├── ai/
    │   ├── prompt-schema.test.js ← Real API calls: validates prompt output schema
    │   └── adversarial.test.js   ← Adversarial inputs: prompt injection, edge cases
    └── security/
        └── security.test.js      ← XSS, prompt injection, API key exposure, input limits
```

---

## Running Tests

### Fast tests (no API calls — run these always)

```bash
cd self-hosted
npm test                  # unit + security tests
npm run test:watch        # watch mode for development
npm run test:security     # security tests only
npm run test:coverage     # with coverage report
```

### AI tests (make real API calls — cost tokens)

```bash
cd self-hosted
ANTHROPIC_API_KEY=sk-ant-... npm run test:ai
```

**Estimated cost:** ~15,000 tokens for the full AI test suite (~$0.05–0.15 at current pricing).

### Full suite

```bash
ANTHROPIC_API_KEY=sk-ant-... npm run test:all
```

---

## What Each Test File Covers

### `unit/helpers.test.js`
| Test Group | What It Tests |
|---|---|
| `TS()` | Returns valid ISO 8601, close to now |
| `uid()` | Unique, alphanumeric, non-empty |
| `UPDATE_TYPES` | All 5 types exist with label/color/icon, valid hex colors |
| `STATUS_COLORS` | All 4 statuses exist, Blocked is red |
| `detectMissing()` | Flags missing project, short summary, low confidence, uncertain fields |
| `commitToBoard()` | Creates/updates projects, case-insensitive matching, prepend ordering |
| Update schema | Accepts valid updates, rejects bad type/status/confidence values |

### `unit/project-state.test.js`
| Test Group | What It Tests |
|---|---|
| `addProject` | Appends, doesn't mutate, defaults correct |
| Status transitions | All valid transitions, update-driven status changes |
| Blocker detection | Identifies blocked projects correctly |
| Update ordering | Most recent first |
| Export logic | JSON/Markdown validity, no sensitive field leakage |
| Stats | totalUpdates, blocked count, project count |

### `security/security.test.js`
| Test Group | What It Tests |
|---|---|
| XSS Prevention | 8 XSS payloads stored as plain text, not executed |
| Prompt Injection | Schema validator catches injected fields/types |
| API Key Exposure | Keys never appear in exports or project data |
| Malicious handshake | Prototype pollution, constructor injection, field stripping |
| Input length | Empty, 10k char names, 50k char details handled without throwing |

### `ai/prompt-schema.test.js` *(requires API key)*
| Test Group | What It Tests |
|---|---|
| Reporter prompt | Schema compliance, blocker/tool classification, missing field detection |
| Prompt injection | Schema holds under injection attempts |
| Push agent prompt | All top-level fields present, first_update valid, script contains functions |
| Prep agent prompt | All 6 audit categories, overall_score range, handshake fields, scoring differential |

### `ai/adversarial.test.js` *(requires API key)*
| Test Group | What It Tests |
|---|---|
| Prompt injection | "Ignore instructions", role confusion, JSON break, system prompt extraction |
| Edge cases | Emoji-only, non-English, JSON input, repeated text, unicode, multi-project, conflicting signals |
| Schema invariants | confidence always 0–1, type always valid enum, regardless of adversarial input |

---

## CI Behaviour

| Trigger | Tests Run |
|---|---|
| Every push / PR | Unit tests + Security tests + Build check |
| Manual trigger (`workflow_dispatch`) | + AI prompt tests |
| Release tag (`v*`) | + AI prompt tests |

The AI tests are intentionally excluded from the default push trigger to avoid burning API credits on every commit. Run them manually before tagging a release.

---

## Adding Tests

**New unit test:**
Add to `tests/unit/` — follows the same pattern, no API calls.

**New AI prompt test:**
Add to `tests/ai/prompt-schema.test.js` inside the appropriate `describeAI` block. Always use `ENABLE_AI_TESTS` guard and set a generous timeout (30s per call minimum).

**New security test:**
Add to `tests/security/security.test.js`. No API calls — use the mock/simulate pattern already in the file.

---

## Adding the API Key to GitHub Actions

For AI tests to run in CI on releases:

1. Go to your repo → Settings → Secrets and variables → Actions
2. Click **New repository secret**
3. Name: `ANTHROPIC_API_KEY`
4. Value: your Anthropic API key
5. Click **Add secret**

The unit and security tests run without any secret — only the AI tests need the key.

---

## Coverage Thresholds

Defined in `vitest.config.js`. CI will fail if coverage drops below:

| Metric | Threshold |
|---|---|
| Lines | 70% |
| Functions | 70% |
| Branches | 60% |
| Statements | 70% |

Run `npm run test:coverage` to see current coverage. The HTML report is at `coverage/index.html`.
#CI triggered
