# Your First Project

This guide bridges **installing the tracker** and **connecting agents**. If you've completed [Getting Started](./GETTING_STARTED.md) and have the app running at [http://localhost:3000](http://localhost:3000), you're in the right place.

---

## Two different "projects"

It's easy to mix these up:

| | **Tracker app** | **Tracked project** |
|---|---|---|
| **What it is** | The React app you installed (`ai-project-tracker/self-hosted`) | An external repo or agent you want to monitor |
| **Where it lives** | `self-hosted/` in this repository | Your own codebase (Python agent, web app, etc.) |
| **What you do here** | View the board, log updates, generate scripts | Drop in `.tracker-config.json` and reporter scripts |

Everything in this guide happens **in the tracker UI** unless noted otherwise.

---

## Know the tabs

The header has five tabs:

| Tab | Purpose |
|---|---|
| **BOARD** | See all tracked projects, add new ones, view update history |
| **LOG UPDATE** | Paste a raw update from any AI, parse it into the schema, commit it |
| **REPORTER** | Generate Push or Pull reporter scripts (or copy the schema prompt) |
| **PREP AGENT** | Audit a project and generate `.tracker-config.json` |
| **AGENT API** | Reference for webhook format and agent system prompts |

---

## Path A: Quick start (no external repo yet)

Best if you just want to try the tracker or log updates manually.

### 1. Add a project on the Board

1. Open [http://localhost:3000](http://localhost:3000).
2. Click **BOARD** (selected by default).
3. Type a name in **New project name…** and click **+ ADD**.

You'll see a project card with status **Active**. Click it to expand the update log.

### 2. Log your first update

1. Click **LOG UPDATE**.
2. Paste a raw work summary — from ChatGPT, Claude, Gemini, or your own notes. For example:

   ```
   Today I added a web search tool to the agent. It uses SerpAPI.
   Ran out of API credits so testing isn't done yet.
   Next step is to top up credits and run the eval suite.
   ```

3. Click **⟳ PARSE UPDATE**.
4. Review the parsed fields on the right (project name, type, status, summary, etc.).
5. Click **✓ COMMIT UPDATE**.

The update appears on the **BOARD**. If the project name in the parsed update doesn't match an existing card, the tracker creates one automatically.

### 3. (Optional) Use the reporter prompt elsewhere

1. Click **REPORTER** → **◈ PROMPT REF**.
2. Click **⎘ COPY PROMPT**.
3. Paste it as a system prompt in any AI tool so future responses follow the tracker's JSON schema.
4. Copy those responses back into **LOG UPDATE** → parse → commit.

---

## Path B: Connect an external project

Best when you have a real codebase and want automated reporting.

### 1. Prep the external project

1. Click **PREP AGENT**.
2. Fill in what you know about the project (name is required):
   - **Project Name**, **What it does**, **Stack / Tools**, **AI Model**
   - **Known Blockers** and **Known Gaps / Issues** if applicable
   - **Current Status** and **Agent Mode** (autonomous vs human-in-loop)
3. Click **◈ RUN PREP AGENT**.

The Prep Agent returns:

- A **compliance audit** scored across six categories
- A **`.tracker-config.json`** handshake file — click **⎘ COPY** and save it to your external project's root
- An optional **prep script** for automated fixes
- A **compliance update** logged to the Board automatically

### 2. Generate a reporter

Choose based on how much the tracker already knows:

**Push mode** — you know the project details; the tracker generates a pre-configured reporter:

1. Click **REPORTER** → **▲ PUSH MODE**.
2. Fill in project name, description, stack, model, stage, and agent type.
3. Click **▲ GENERATE PUSH REPORTER + LOG FIRST UPDATE**.
4. Copy the **PUSH REPORTER SCRIPT** and save it (e.g. as `reporter.py`) in your external project.

**Pull mode — autonomous** — the reporter discovers the project on its own:

1. Click **REPORTER** → **▼ PULL MODE** → **🤖 Autonomous Pull**.
2. Click **▼ GENERATE AUTONOMOUS PULL REPORTER**.
3. Copy the script and drop it into your external project folder.

**Pull mode — human interview** — you describe the project in a chat:

1. Click **REPORTER** → **▼ PULL MODE** → **👤 Human Interview**.
2. Click **▼ START INTERVIEW** and answer one question at a time.
3. When done, the first update is logged to the Board automatically.

### 3. Verify on the Board

1. Click **BOARD**.
2. Confirm your project card shows the expected status and latest update.
3. Click the card to review the full update history.

---

## Recommended order

```
Install tracker → Open app → Add/log first update (Path A)
                                    ↓
              Need automation? → Prep Agent → Push or Pull reporter → Drop files in external repo
                                    ↓
              Need API details? → AGENT API tab + API Reference guide
```

For deeper walkthroughs of Prep, Push, and Pull, continue to [Workflows](./WORKFLOWS.md).  
For scenario-based examples, see [Examples](./EXAMPLES.md).

---

## Important limitations

- **Server + browser storage** — projects persist in `data/projects.json` on the server and cache in this browser's `localStorage`. Run `npm run dev` (starts both API and UI). Export/import on **AGENT API** for backup.
- **Agent authentication** — external agents must send `X-Agent-Key` matching `VITE_AGENT_KEY` in `.env` (default: `dev-agent-key`). Change this before exposing the tracker to a network.
- **API key required** — AI features (parse, prep, reporter generation) need a valid `VITE_ANTHROPIC_API_KEY` in `self-hosted/.env`. Restart `npm run dev` after changing it.

---

## Troubleshooting

| Problem | What to check |
|---|---|
| Parse / Prep / Reporter buttons do nothing | `.env` has a real `VITE_ANTHROPIC_API_KEY`; dev server was restarted after editing `.env` |
| "Parse failed" toast | API key valid and has credits; check browser console for errors |
| Project doesn't appear after commit | Check the **project** field in the parsed update — a new card is created from that name |
| Generated script doesn't run in external repo | Scripts are starting points — ensure `VITE_TRACKER_URL` and `VITE_AGENT_KEY` in `.env` match what the script sends |
| Agent POST not on board | Run `npm run dev` (API required); wait ~5s for UI poll; check `X-Agent-Key` header |

More fixes: [Troubleshooting Guide](./TROUBLESHOOTING.md)

---

**Next:** [Workflows](./WORKFLOWS.md) — detailed Prep, Push, and Pull walkthroughs in the UI.
