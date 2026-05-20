# Workflows in AI Project Tracker

This guide details the core workflows — **Prep Agent**, **Push Reporter**, and **Pull Reporter** — as they work in the **web UI**. All steps assume the tracker is running at [http://localhost:3000](http://localhost:3000).

If you haven't added a project yet, start with [Your First Project](./FIRST_PROJECT.md).

---

## Prep Agent Workflow

The **Prep Agent** audits a project for reporter compliance and produces a `.tracker-config.json` handshake file.

### When to use

- Before deploying a reporter to a new external project
- To check whether a project has the documentation, git history, and config a reporter needs

### Steps

1. Open the tracker and click **PREP AGENT** in the header.
2. Fill in the form:
   - **Project Name** (required)
   - **What it does**, **Stack / Tools**, **AI Model**
   - **Known Blockers**, **Known Gaps / Issues**
   - **Current Status** and **Agent Mode**
3. Click **◈ RUN PREP AGENT**.
4. Review the results:
   - **Compliance audit** — score and per-category pass/warn/fail
   - **Fix list** — automated vs manual actions
   - **`.tracker-config.json`** — click **⎘ COPY** and save to your external project's root
   - **Prep script** — optional Python script for automated fixes
5. A **compliance update** is logged to the **BOARD** automatically.

### Troubleshooting

- **Problem**: Button stays disabled.
  - **Solution**: Enter a **Project Name**. Ensure `VITE_ANTHROPIC_API_KEY` is set in `self-hosted/.env`.
- **Problem**: Generation fails or times out.
  - **Solution**: Check your API key and Anthropic account credits. Open the browser console for error details.
- **Problem**: Audit scores are low.
  - **Solution**: Follow the fix list — add a README, initialize git, declare dependencies, etc. — then run Prep again.

---

## Push Reporter Workflow

The **Push Reporter** generates a pre-configured script for projects the tracker already knows about.

### When to use

- You can describe the project (name, stack, model, current state)
- The receiving agent should drop in a script and run it with zero configuration

### Steps

1. Click **REPORTER** → **▲ PUSH MODE**.
2. Fill in:
   - **Project Name** and **What it does** (required)
   - **Stack / Tools**, **AI Model**
   - **Stage** — New or In Progress
   - **Receiving Agent Type** — Autonomous or Human-in-loop
   - **Current State / Context** (if In Progress)
3. Click **▲ GENERATE PUSH REPORTER + LOG FIRST UPDATE**.
4. Copy the **PUSH REPORTER SCRIPT** and save it in your external project (e.g. `reporter.py`).
5. Read **HOW THE RECEIVING AGENT USES THIS** for embed instructions.
6. Confirm the **first update** appeared on the **BOARD**.

### Troubleshooting

- **Problem**: Generate button is disabled.
  - **Solution**: Fill in **Project Name** and **What it does**.
- **Problem**: Script is missing endpoint or config values.
  - **Solution**: Run **PREP AGENT** first. Ensure `VITE_TRACKER_URL` and `VITE_AGENT_KEY` are set in `.env` — Prep injects them into the handshake automatically.

---

## Pull Reporter Workflow

The **Pull Reporter** goes out to a project the tracker doesn't know yet — either by inspecting files or interviewing you.

### Autonomous mode

The generated script scans README, git log, `package.json`, `requirements.txt`, and TODO files, then posts a first update.

1. Click **REPORTER** → **▼ PULL MODE** → **🤖 Autonomous Pull**.
2. Click **▼ GENERATE AUTONOMOUS PULL REPORTER**.
3. Copy the script and place it in your external project folder.
4. Run it from that project's environment.

### Human-in-loop mode

The tracker interviews you one question at a time, then builds and logs the first update.

1. Click **REPORTER** → **▼ PULL MODE** → **👤 Human Interview**.
2. Click **▼ START INTERVIEW**.
3. Answer each question in the chat panel.
4. When the interview completes, check the **BOARD** for the auto-logged update.

### Troubleshooting

- **Problem**: Autonomous script finds little context.
  - **Solution**: Ensure the external project has a README, git history, and dependency files (`package.json`, `requirements.txt`, etc.).
- **Problem**: Interview stops or doesn't produce an update.
  - **Solution**: Provide more detail in answers. Check API key and browser console. Click **+ START NEW INTERVIEW** to retry.

---

## Manual updates (LOG UPDATE)

You don't need an agent to log progress:

1. Click **LOG UPDATE**.
2. Paste raw text from any AI or your own notes.
3. Click **⟳ PARSE UPDATE** → review fields → **✓ COMMIT UPDATE**.

This creates or updates a project on the **BOARD** based on the parsed project name.

---

## Prompt reference (no generation)

To make any external AI output tracker-compatible JSON without generating a script:

1. Click **REPORTER** → **◈ PROMPT REF**.
2. Copy the schema prompt into ChatGPT, Claude, Gemini, or Copilot.
3. Paste AI responses into **LOG UPDATE** for parsing.

---

For your first time through these steps, see [Your First Project](./FIRST_PROJECT.md).  
For real-world scenarios, see [Examples](./EXAMPLES.md).  
For issues, see [Troubleshooting](./TROUBLESHOOTING.md).
