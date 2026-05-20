# Troubleshooting Guide

Common issues for setup, the webhook API, and UI workflows.

---

## Setup

### Clone / install

| Problem | Solution |
|---|---|
| `git` not found | [Install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) |
| `npm install` fails | Node 18+; try `npm cache clean --force` |
| Permission denied cloning | Use HTTPS URL or check GitHub SSH keys |

### Environment

| Problem | Solution |
|---|---|
| AI features don't work | Set `VITE_ANTHROPIC_API_KEY` in `self-hosted/.env`, restart `npm run dev` |
| Agent POST returns 401 | Set `VITE_AGENT_KEY` in `.env`; send same value as `X-Agent-Key` header |
| Wrong webhook URL in scripts | Set `VITE_TRACKER_URL=http://localhost:3000/api/project-update` |

### Starting the app

| Problem | Solution |
|---|---|
| Nothing at localhost:3000 | Run `npm run dev` from `self-hosted/`; check ports 3000 and 3001 |
| UI works, API calls fail | Don't run `dev:client` alone — need `npm run dev` or `dev:server` |
| Port in use | Stop other processes on 3000/3001 or set `PORT` for production |

---

## Webhook API

| Problem | Solution |
|---|---|
| `curl` to `/api/project-update` fails | API must be running; use port 3000 in dev (proxied) |
| 401 Unauthorized | Header: `X-Agent-Key: dev-agent-key` (or your `VITE_AGENT_KEY`) |
| 400 Bad Request | Required: `type`, `project`, `summary`, `status` with valid enum values |
| Update POST succeeds, board unchanged | Wait ~5s for poll, or refresh; confirm `npm run dev` not client-only |
| Data lost after reinstall | Server data is in `self-hosted/data/projects.json`; back up that file |

Test with:

```bash
curl -X POST http://localhost:3000/api/project-update \
  -H "Content-Type: application/json" \
  -H "X-Agent-Key: dev-agent-key" \
  -d '{"type":"daily","project":"Test","summary":"Webhook test update","status":"Active"}'
```

See [API Reference](./API_REFERENCE.md).

---

## UI workflows

All workflows run in the browser at [http://localhost:3000](http://localhost:3000). See [Your First Project](./FIRST_PROJECT.md) and [Workflows](./WORKFLOWS.md).

### Prep Agent

| Problem | Solution |
|---|---|
| **◈ RUN PREP AGENT** fails | Check Anthropic key, credits, browser console |
| Low audit scores | Follow fix list; add README, git, dependencies to external repo |
| Handshake missing URL/key | Set `VITE_TRACKER_URL` and `VITE_AGENT_KEY` in `.env`, re-run Prep |

### Push / Pull Reporter

| Problem | Solution |
|---|---|
| Generate button disabled | Fill required fields (project name, description for Push) |
| Script has placeholder URL | Re-generate after setting `VITE_TRACKER_URL` in `.env` |
| Pull script finds no context | External repo needs README, git history, dependency files |

### Log Update

| Problem | Solution |
|---|---|
| Parse fails | Valid API key; pasted text must describe real work |
| Wrong project on board | Edit **project** field before **✓ COMMIT UPDATE** |

---

## Import / export

| Problem | Solution |
|---|---|
| Import fails | File must be a JSON array of projects or `{ "projects": [...] }` with valid structure |
| Export empty | Add projects first; export from **AGENT API** tab |

---

## General

| Problem | Solution |
|---|---|
| `EACCES` on npm install | Fix directory permissions; avoid unnecessary `sudo` |
| Module errors | `rm -rf node_modules && npm ci` |
| Still stuck | [Open an issue](https://github.com/trevorseitz-ai/ai-project-tracker/issues) with OS, Node version, and terminal output |

---

See also [Testing](./TESTING.md) for automated checks and [Roadmap](./ROADMAP.md) for features not yet built.
