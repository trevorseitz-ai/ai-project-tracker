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
3. You may see a sample card called **Project Alpha** — that's normal. Add your own project below it.
4. Type a name (e.g. `History Essay Bot`) in **New project name…**
5. Click **+ ADD**.

You will see a card for your project.

**Tip:** You can also skip **+ ADD** and go straight to **LOG UPDATE** — committing an update with a new project name creates a card automatically.

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
4. When Prep finishes, click **⎘ COPY .tracker-config.json** at the top of the results (scroll down if needed).
5. Save the file in your **outside project** — see [Where to save `.tracker-config.json`](#where-to-save-tracker-configjson) below.

Prep also adds an update to your **BOARD**.

### Where to save `.tracker-config.json`

This file goes in the **project you are tracking** (your homework app, Python repo, etc.) — **not** inside the `ai-project-tracker` folder.

| What | Details |
|------|---------|
| **Exact file name** | `.tracker-config.json` — including the dot at the start |
| **Where** | The **top folder** of that project (the same folder that has `README.md`, `package.json`, or `requirements.txt`) |
| **Not here** | Do not put it in subfolders like `src/` unless your whole project lives there |

**Example:** If your project is at `/Users/you/Projects/ReelDive/`, save:

```
/Users/you/Projects/ReelDive/.tracker-config.json
```

**How to create the file:**

1. Open a text editor (VS Code, Notepad, TextEdit).
2. Paste what you copied from the tracker.
3. Save As → name the file exactly **`.tracker-config.json`**.
4. On Mac, if the editor adds `.txt`, rename the file in Finder so it ends with `.json` only.

On Mac/Linux the leading dot makes it a “hidden” file — that is normal. In VS Code you will still see it in the file list.

### Step 2: Create a reporter script

Pick **one** option:

**Option A — Push (you know the project details)**

1. Click **REPORTER** → **▲ PUSH MODE**.
2. Fill in **Project Name** and **What it does** (required).
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

## Where your data lives

When you shut down your computer, your projects **do not disappear**. They are stored on your hard drive and in your browser.

| Location | What it is | Survives shutdown? |
|----------|------------|-------------------|
| `self-hosted/data/projects.json` | Main save file on your computer | Yes |
| Browser storage (`localStorage`) | Extra copy in Chrome/Safari/etc. | Yes, in that same browser |

The server file is updated whenever you change something **and** `npm run dev` is running (you must see both **api** and **web** in the terminal).

---

## Backing up (local file or Google Drive)

There is **no built-in Google Drive button** today. You have two simple options:

### Option 1: Download a backup (easiest)

1. Click **AGENT API** → **⬇ EXPORT JSON**.
2. Save `projects.json` anywhere — Documents, a USB drive, or upload it to [Google Drive](https://drive.google.com) in your browser.
3. To restore later: **AGENT API** → **⬆ IMPORT JSON** and choose that file.

Do this before reinstalling the app or switching computers.

### Option 2: Auto-sync with Google Drive Desktop (advanced)

If you use [Google Drive for Desktop](https://www.google.com/drive/download/), you can tell the app to save directly into a synced folder:

1. Create a folder in Google Drive, e.g. `AI Project Tracker`.
2. Add this line to `self-hosted/.env` (use your real path):

```plaintext
DATA_DIR=/Users/yourname/Library/CloudStorage/Google Drive/My Drive/AI Project Tracker
```

3. Restart `npm run dev`.

The app will write `projects.json` into that folder. Google Drive syncs it to the cloud automatically.

---

## Good to know

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
