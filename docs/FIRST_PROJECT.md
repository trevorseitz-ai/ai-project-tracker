# Your First Project

The app should already be open at [http://localhost:3000](http://localhost:3000).

This guide shows you how to **use** the tracker — add projects, log updates, and (optionally) connect outside code.

---

## Two things called "project"

| | **The tracker** | **A project you track** |
|---|-----------------|-------------------------|
| What | This app in your browser | Your own homework app, Python script, etc. |
| Where | `ai-project-tracker/self-hosted` | A folder on your computer |

Everything below happens **inside the tracker website** unless we say otherwise.

---

## The five tabs

| Tab | What it does |
|-----|--------------|
| **BOARD** | See your projects and their status |
| **LOG UPDATE** | Paste text → app organizes it → save to the board |
| **REPORTER** | Create helper scripts for outside projects |
| **PREP AGENT** | Check if an outside project is ready + make a config file |
| **AGENT API** | Backup/export data; see how outside programs send updates |

---

## Part 1: Try the app

No extra folders or scripts needed.

### Step 1: Add a project

1. Go to [http://localhost:3000](http://localhost:3000).
2. You should be on **BOARD** (top menu).
3. Type a name (e.g. `History Essay Bot`) in **New project name…**
4. Click **+ ADD**.

You will see a card for your project.

### Step 2: Log an update

1. Click **LOG UPDATE** in the top menu.
2. Paste any summary of work — from ChatGPT, Claude, or your own notes. Example:

   ```
   Today I fixed the bibliography bug. Still need to test on mobile.
   Next: run tests on my phone.
   ```

3. Click **⟳ PARSE UPDATE**.
4. Check the fields on the right (project name, summary, status).
5. Click **✓ COMMIT UPDATE**.

Your update shows up on **BOARD**. Click the project card to read it.

### Step 3 (optional): Copy a prompt for ChatGPT or Claude

1. Click **REPORTER** → **◈ PROMPT REF**.
2. Click **⎘ COPY PROMPT**.
3. Paste it into ChatGPT or Claude so their answers use the tracker's format.
4. Copy their answer back into **LOG UPDATE** → parse → commit.

**Part 1 is complete.** You know the basics.

---

## Part 2: Connect an outside project (optional)

Do this when you have a real code folder and want the tracker to help it send updates automatically.

### Step 1: Run Prep Agent

1. Click **PREP AGENT**.
2. Fill in the form (at minimum **Project Name**).
3. Click **◈ RUN PREP AGENT**.
4. Click **⎘ COPY** next to **`.tracker-config.json`**.
5. Save that file in your outside project's main folder.

Prep also adds an update to your **BOARD**.

### Step 2: Create a reporter script

Pick **one** option:

**Option A — Push (you know the project details)**

1. Click **REPORTER** → **▲ PUSH MODE**.
2. Fill in project name and description.
3. Click **▲ GENERATE PUSH REPORTER + LOG FIRST UPDATE**.
4. Copy the script and save it in your outside project (e.g. `reporter.py`).

**Option B — Pull, automatic (script reads the folder itself)**

1. Click **REPORTER** → **▼ PULL MODE** → **🤖 Autonomous Pull**.
2. Click **▼ GENERATE AUTONOMOUS PULL REPORTER**.
3. Copy the script into your outside project.

**Option C — Pull, interview (you answer questions)**

1. Click **REPORTER** → **▼ PULL MODE** → **👤 Human Interview**.
2. Click **▼ START INTERVIEW** and answer each question.
3. When finished, check **BOARD** for the new update.

### Step 3: Check the board

1. Click **BOARD**.
2. Make sure your project shows the latest update.

---

## What to read next

| Goal | Guide |
|------|-------|
| More detail on Prep / Push / Pull | [Workflows](./WORKFLOWS.md) |
| Real-world examples | [Examples](./EXAMPLES.md) |
| Something broke | [Troubleshooting](./TROUBLESHOOTING.md) |

---

## Good to know

- **Your data is saved** in `self-hosted/data/projects.json` while the app runs. You can also export a backup from **AGENT API** → **⬇ EXPORT JSON**.
- **Keep `npm run dev` running** while you use the app.
- **AI features need your API key** in `.env`. If you change `.env`, restart the app.
- **Outside agents** need the same key as `VITE_AGENT_KEY` in `.env` (default: `dev-agent-key`).

---

## Common problems

| Problem | What to try |
|---------|-------------|
| Parse button does nothing | Check API key in `.env`; restart `npm run dev` |
| Wrong project name on board | Edit the **project** field before clicking commit |
| Outside script fails | Make sure `VITE_TRACKER_URL` and `VITE_AGENT_KEY` are in `.env` |

More help: [Troubleshooting](./TROUBLESHOOTING.md)
