# Examples

Sample ways to use the tracker at [http://localhost:3000](http://localhost:3000). Each example lists steps **in the order to do them**.

---

## Example 1: Python AI project

**Situation:** You have a Python project with a README and `requirements.txt`.

**Steps (in order):**

1. **PREP AGENT** — enter project name `Python NLP Project`, stack `Python, LangChain`, model `GPT-4`. Click **◈ RUN PREP AGENT**.
2. Copy `.tracker-config.json` into your Python project's folder.
3. **REPORTER → ▲ PUSH MODE** — enter the same details. Click generate. Copy the script as `reporter.py` in that folder.
4. **BOARD** — confirm the project card shows an update.

---

## Example 2: Data science project

**Situation:** You track a pipeline; results live in a `results/` folder.

**Steps (in order):**

1. **LOG UPDATE** — paste a short status summary. Parse and commit. (Creates the project on the board.)
2. **PREP AGENT** — describe the pipeline. Mention `results/` in **Known Gaps / Issues** if needed.
3. **REPORTER → ▼ PULL MODE → 🤖 Autonomous Pull** — generate the script and run it in your project folder.
4. **BOARD** — check that updates look correct.

---

## Example 3: Two AI tools on two repos

**Situation:** Claude handles summaries; GPT-4 handles chat — separate folders.

**Steps (in order):**

1. **PREP AGENT** for repo 1 → copy config file into repo 1.
2. **PREP AGENT** for repo 2 → copy config file into repo 2.
3. **PUSH MODE** for each repo → copy each script into the matching folder.
4. **LOG UPDATE** anytime you want a combined status on one board card.
5. **BOARD** — use different project names so cards stay separate.

---

## Tips

- **Rename carefully** — the board matches projects by name.
- **Manual updates anytime** — use **LOG UPDATE** between automated runs.
- **Copy prompt** — **REPORTER → ◈ PROMPT REF** works with any AI chat tool.

---

More detail: [Workflows](./WORKFLOWS.md) · Problems: [Troubleshooting](./TROUBLESHOOTING.md)
