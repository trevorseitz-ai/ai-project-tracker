# Examples Guide

Real-world scenarios for the AI Project Tracker. Each example uses the **web UI** at [http://localhost:3000](http://localhost:3000). If you're new to the app, read [Your First Project](./FIRST_PROJECT.md) first.

---

## Example 1: Software Development Project

### Scenario

You're managing a Python-based AI project using GPT-4 and LangChain. The repo has version control, a README, and `requirements.txt`.

### Workflow

1. **Prep the project** — click **PREP AGENT**, enter:
   - Project Name: `Python NLP Project`
   - Stack: `Python, LangChain`
   - Model: `GPT-4`
   - Click **◈ RUN PREP AGENT**
2. **Copy handshake file** — from the results, copy `.tracker-config.json` and save it to your Python project's root.
3. **Generate a Push reporter** — click **REPORTER** → **▲ PUSH MODE**, fill in the same project details, click **▲ GENERATE PUSH REPORTER + LOG FIRST UPDATE**.
4. **Deploy the script** — copy the generated reporter script into your Python project as `reporter.py`.
5. **Verify** — click **BOARD** and confirm the project card shows the first update.

### Troubleshooting

- **Prep audit warns on dependencies** — ensure `requirements.txt` exists and lists packages clearly.
- **Reporter script missing fields** — re-run Prep or edit `.tracker-config.json` manually before copying the Push reporter.

---

## Example 2: Data Science Pipeline

### Scenario

You're tracking a data science pipeline using R and Python. Output lives in a `results/` directory.

### Workflow

1. **Log a manual update first** — click **LOG UPDATE**, paste a summary of current pipeline status, parse and commit. This creates the project on the Board immediately.
2. **Prep for compliance** — click **PREP AGENT**, describe the pipeline, note `results/` in **Known Gaps / Issues** if the audit should account for it.
3. **Pull updates autonomously** — click **REPORTER** → **▼ PULL MODE** → **🤖 Autonomous Pull**, generate the script, and run it inside the pipeline repo so it can inspect files and git history.
4. **Review on the Board** — confirm parsed updates show `type: progress`, correct status, and next steps.

### Troubleshooting

- **Pull reporter misses `results/`** — autonomous mode scans standard files (README, git log, dependency manifests). Mention output locations in the README or log manual updates via **LOG UPDATE**.
- **Incomplete updates** — switch to **👤 Human Interview** under Pull mode for richer context.

---

## Example 3: Multi-Model Coordination

### Scenario

You're coordinating Claude (summarization) and GPT-4 (chatbot) on related but separate repos.

### Workflow

1. **Prep each repo separately** — run **PREP AGENT** once per project, copy each `.tracker-config.json` to the respective repo root.
2. **Push reporters per model** — for each project, use **REPORTER** → **▲ PUSH MODE** with the correct model name and stack. Copy each script to its repo.
3. **Track coordination manually** — use **LOG UPDATE** to paste cross-model status summaries, or use **Pull** → **Human Interview** for a coordination overview project.
4. **Monitor on the Board** — each project gets its own card; use status buttons to mark blockers across the fleet.

### Troubleshooting

- **Conflicting project names** — use distinct names per repo so Board cards stay separate.
- **Shared dependencies** — document shared config in each project's Prep form under **Known Gaps / Issues**.

---

## Common adjustments

1. **Custom fields in handshake** — edit the copied `.tracker-config.json` before saving to your external repo.
2. **Manual updates between agent runs** — use **LOG UPDATE** anytime; projects are matched by name.
3. **Schema prompt for ad-hoc AIs** — **REPORTER** → **◈ PROMPT REF** → copy into any AI tool.

---

For step-by-step UI instructions, see [Workflows](./WORKFLOWS.md).  
For issues, see [Troubleshooting](./TROUBLESHOOTING.md).
