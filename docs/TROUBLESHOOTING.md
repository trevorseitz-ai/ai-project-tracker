# Troubleshooting

Fix common problems with setup and using the app at [http://localhost:3000](http://localhost:3000).

---

## Setup problems

| Problem | What to try |
|---------|-------------|
| `git` not found | Install Git from [git-scm.com](https://git-scm.com/) |
| `npm` not found | Install Node.js 18+ from [nodejs.org](https://nodejs.org/) |
| `npm install` fails | Run `npm cache clean --force`, then try again |
| Page won't load | Run `npm run dev` from the `self-hosted` folder and leave that window open. You should see both **api** and **web** start |
| Port already in use | Close other apps using port 3000, or restart your computer |
| AI buttons don't work | Add `VITE_ANTHROPIC_API_KEY` to `self-hosted/.env`, save, stop the app (Ctrl+C), run `npm run dev` again |

---

## Board and LOG UPDATE

| Problem | What to try |
|---------|-------------|
| Parse button does nothing | Check your API key in `.env` and restart `npm run dev` |
| Wrong project name on board | Edit the **project** field on the right, then click **✓ COMMIT UPDATE** |
| Update missing on board | Wait a few seconds, or refresh the page |
| Board out of sync | Use `npm run dev` — not `npm run dev:client` alone |

---

## Prep Agent and Reporter

| Problem | What to try |
|---------|-------------|
| Prep button grayed out | Enter a project name; check API key in `.env` |
| Push button grayed out | Fill in **Project Name** and **What it does** |
| Script has wrong web address | Set `VITE_TRACKER_URL=http://localhost:3000/api/project-update` in `.env`, restart the app, run Prep again |
| Pull script finds nothing | Add a README and dependency files (like `requirements.txt`) to your outside project |

---

## Backup and import (AGENT API tab)

| Problem | What to try |
|---------|-------------|
| Export is empty | Add at least one project on the board first |
| Import fails | File must be JSON — an array of projects or `{ "projects": [...] }` |
| Lost data after reinstall | Use **⬇ EXPORT JSON** before uninstalling; restore with **⬆ IMPORT JSON** |
| Want Google Drive backup | Export JSON and upload to Drive, or set `DATA_DIR` in `.env` to a Google Drive sync folder (see [Your First Project](./FIRST_PROJECT.md#backing-up-local-file-or-google-drive)) |

---

## Outside programs sending updates (advanced)

Use this when a script or agent POSTs updates to the tracker.

| Problem | What to try |
|---------|-------------|
| Request returns 401 | Set `VITE_AGENT_KEY` in `.env` and send the same value in the `X-Agent-Key` header |
| Request returns 400 | Body must include `type`, `project`, `summary`, and `status` |
| POST works but board doesn't change | Wait ~5 seconds for the page to refresh, or reload the browser |

Test with:

```bash
curl -X POST http://localhost:3000/api/project-update \
  -H "Content-Type: application/json" \
  -H "X-Agent-Key: dev-agent-key" \
  -d '{"type":"daily","project":"Test","summary":"Webhook test update","status":"Active"}'
```

Full details: [API Reference](./API_REFERENCE.md)

---

## Still stuck?

1. Stop the app (Ctrl+C in the terminal).
2. Run `rm -rf node_modules && npm install` in `self-hosted/`.
3. Run `npm run dev` again.

If it still fails, [open an issue](https://github.com/trevorseitz-ai/ai-project-tracker/issues) with your operating system, Node version, and the error message from the terminal.
