# Testing Guide

Full testing documentation lives in **[docs/TESTING.md](./docs/TESTING.md)**.

Quick reference from `self-hosted/`:

```bash
npm test                  # unit tests
npm run test:security     # security tests
npm run test:coverage     # coverage report
ENABLE_AI_TESTS=true ANTHROPIC_API_KEY=sk-ant-... npm run test:ai
```

Run unit + security before committing:

```bash
npm test && npm run test:security
```

Manual API smoke test (requires `npm run dev`):

```bash
curl -X POST http://localhost:3000/api/project-update \
  -H "Content-Type: application/json" \
  -H "X-Agent-Key: dev-agent-key" \
  -d '{"type":"daily","project":"Test","summary":"Smoke test update","status":"Active"}'
```
