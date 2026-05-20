# Workflows

The app should be open at [http://localhost:3000](http://localhost:3000).

This guide explains each tab in more detail, in the order most people use them.

---

## 1. Log an update (LOG UPDATE tab)

The simplest workflow. Use this anytime you want to record progress.

1. Click **LOG UPDATE**.
2. Paste text from any AI or your own notes.
3. Click **⟳ PARSE UPDATE**.
4. Review the fields on the right.
5. Click **✓ COMMIT UPDATE**.

The update appears on **BOARD**. New project names create a new card automatically.

---

## 2. Prep Agent (PREP AGENT tab)

Use this when you want to connect an **outside project folder** and create a config file (`.tracker-config.json`).

1. Click **PREP AGENT**.
2. Fill in the form (**Project Name** is required).
3. Click **◈ RUN PREP AGENT**.
4. Review the score and suggestions.
5. Click **⎘ COPY .tracker-config.json** and save it as **`.tracker-config.json`** in the **top folder** of your outside project (same level as `README.md` — not inside `ai-project-tracker`). See [Your First Project — Where to save](./FIRST_PROJECT.md#where-to-save-tracker-configjson).

An update is added to **BOARD** automatically.

---

## 3. Push Reporter (REPORTER → ▲ PUSH MODE)

Step 3 in the outside-project flow (see diagram below). Creates a ready-to-use script when you know your project's name, tools, and status.

1. Click **REPORTER** → **▲ PUSH MODE**.
2. Fill in **Project Name** and **What it does** (required).
3. Fill in stack, model, and stage if you can.
4. Click **▲ GENERATE PUSH REPORTER + LOG FIRST UPDATE**.
5. Copy the script and save it in your outside project.

Check **BOARD** for the first update.

---

## 4. Pull Reporter (REPORTER → ▼ PULL MODE)

Use this when the tracker should **learn about** an outside folder (or ask you questions).

### Automatic mode

1. Click **REPORTER** → **▼ PULL MODE** → **🤖 Autonomous Pull**.
2. Click **▼ GENERATE AUTONOMOUS PULL REPORTER**.
3. Copy the script into your outside project and run it there.

### Interview mode

1. Click **REPORTER** → **▼ PULL MODE** → **👤 Human Interview**.
2. Click **▼ START INTERVIEW**.
3. Answer each question.
4. Check **BOARD** when the interview finishes.

---

## 5. Prompt reference (REPORTER → ◈ PROMPT REF)

Use this to make ChatGPT, Claude, or Gemini output text the tracker can parse — without making a script.

1. Click **REPORTER** → **◈ PROMPT REF**.
2. Click **⎘ COPY PROMPT**.
3. Paste into your AI tool as instructions.
4. Copy the AI's answer into **LOG UPDATE**.

---

## Suggested order for outside projects

```
LOG UPDATE (try the app)
    ↓
PREP AGENT (make config file)
    ↓
PUSH or PULL REPORTER (make script)
    ↓
Save files in your outside project folder
```

---

## Common problems

| Problem | What to try |
|---------|-------------|
| Prep button grayed out | Enter a project name; check API key in `.env` |
| Push button grayed out | Fill in **Project Name** and **What it does** |
| Script missing web address | Check `VITE_TRACKER_URL` in `.env` and run Prep again |
| Interview stops | Give longer answers; check API key and credits |

More help: [Troubleshooting](./TROUBLESHOOTING.md) · Examples: [Examples](./EXAMPLES.md)
