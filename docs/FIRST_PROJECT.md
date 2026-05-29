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

**Enter project details once:** Use **SELECT PROJECT** on **PREP AGENT** and **REPORTER → ▲ PUSH MODE** to pick a board project (or click a card on **BOARD**). The same name, description, stack, and model carry over — you do not re-type them for Push.

### Step 1: Run Prep Agent

1. Click **PREP AGENT**.
2. Open **SELECT PROJECT** and choose your project from the list — or click that project’s card on **BOARD** first, then come back to **PREP AGENT**.
3. Fill in the form (at minimum **Project Name**). Other fields may already be filled from the board.
4. Click **◈ RUN PREP AGENT**.
5. When Prep finishes, click **⎘ COPY .tracker-config.json** at the top of the results (scroll down if needed).
6. Save the file in your **outside project** — see [Where to save `.tracker-config.json`](#where-to-save-tracker-configjson) below.

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

Step 2 reporter scripts (`reporter.py`) go in this **same folder** — see Step 2 below.

### Step 2: Create a reporter script

A **reporter script** is a small Python file that sends updates from your outside project to the tracker. Pick **one** path below — **Push** or **Pull** — not both.

**Where files live:** Everything goes in the **top folder** of your outside project (same place as `.tracker-config.json`), **not** inside `ai-project-tracker`.

**Example** for a project called ReelDive at `/Users/you/Projects/ReelDive/`:

```
/Users/you/Projects/ReelDive/
├── .tracker-config.json    ← from Step 1
├── reporter.py             ← from Step 2 (Push or Pull automatic only)
├── README.md
└── ... your other files
```

---

## Push Reporter (complete these steps first if you use Push)

Use Push after Step 1 when your project details are already filled in from **SELECT PROJECT**.

1. Click **REPORTER** in the top menu.
2. Click **▲ PUSH MODE** (green tab).
3. Open **SELECT PROJECT** and pick the **same project** as Step 1 (fields should match Prep automatically).
4. Review the form — change anything that looks wrong:
   - **Project Name** and **What it does** (required)
   - **Stack / Tools** and **AI Model** (optional)
   - **Stage** — **🌱 New** if you are just starting, or **🔧 In Progress** if work has already begun
   - **Receiving agent type** — **🤖 Autonomous** if a script runs on its own, or **👤 Human-in-loop** if a person drives each step
   - If you chose **🔧 In Progress**, fill in **Current state / context** (where you left off, blockers, etc.)

   | Field | Choose this when… |
   |-------|-------------------|
   | **🌱 New** | The outside project is brand new — little or no code yet |
   | **🔧 In Progress** | You already have code, docs, or partial work — then fill in **Current state / context** |
   | **🤖 Autonomous** | The reporter will run without a person clicking buttons each time |
   | **👤 Human-in-loop** | A person will review or trigger updates manually |

5. Click **▲ GENERATE PUSH REPORTER + LOG FIRST UPDATE**.
6. Wait for the green toast **Push reporter ready + first update logged ✓** and for **FIRST UPDATE LOGGED** to appear on the right — that is when the board gets a new entry. Saving `reporter.py` alone does **not** add anything to the board.
7. Wait until **PUSH REPORTER SCRIPT** appears on the right.
8. Click **⎘ COPY** next to **PUSH REPORTER SCRIPT**.
9. Open a text editor (VS Code works well).
10. Paste the script.
11. Save As → go to your outside project's **top folder** (the same folder as `.tracker-config.json`).
12. Name the file exactly **`reporter.py`**.
13. You do **not** need to run `reporter.py` right away for Push — it is ready for your AI agent or automation later. The tracker already logged a **first update** on **BOARD** when Generate succeeded in step 5.

Push is done. Continue to [Step 3](#step-3-confirm-it-worked-on-the-board).

---

## Pull Reporter (use this section only if you did not use Push above)

Pull has two options. Pick **one**.

### Pull — automatic (script reads your project folder)

Use this when the tracker should **inspect your folder** (README, git history, etc.) and figure out the project on its own.

1. Click **REPORTER** in the top menu.
2. Click **▼ PULL MODE** (purple tab).
3. Click **🤖 Autonomous Pull**.
4. Click **▼ GENERATE AUTONOMOUS PULL REPORTER**.
5. Wait until **PULL REPORTER SCRIPT** appears.
6. Click **⎘ COPY** next to **PULL REPORTER SCRIPT**.
7. Open a text editor.
8. Paste the script.
9. Save As → your outside project's **top folder** (same folder as `.tracker-config.json`).
10. Name the file exactly **`reporter.py`**.
11. Open **Terminal** and run the script once from that folder:

    ```bash
    cd /Users/you/Projects/YourProjectName
    python3 reporter.py
    ```

    Replace the path with your real project folder. Use `python reporter.py` on Windows if `python3` does not work.

12. The script scans your folder and sends a first update to the tracker.

Pull automatic is done. Continue to [Step 3](#step-3-confirm-it-worked-on-the-board).

### Pull — interview (you answer questions in the browser)

Use this when you want to **describe the project yourself** instead of saving a script. **No file to save.**

1. Click **REPORTER** in the top menu.
2. Click **▼ PULL MODE** (purple tab).
3. Click **👤 Human Interview**.
4. Click **▼ START INTERVIEW**.
5. Read each question and type your answer in **Type your answer…**, then press **→** (or Enter).
6. When the tracker has enough info, it shows **✓ All set — I have enough context. First update has been logged to the board.**

Pull interview is done. Continue to [Step 3](#step-3-confirm-it-worked-on-the-board).

---

### Step 3: Confirm it worked on the board

1. Click **BOARD** in the top menu.
2. Find the **card with your project name** (the same name you used in Prep or Push).
3. Click that card.
4. You should see at least one **update** listed — for example a prep audit, a push deployment, or text from the pull script or interview.
5. If the card is missing or has no updates:
   - Make sure `npm run dev` is still running in Terminal.
   - For **Pull — automatic**, confirm you ran `python3 reporter.py` in your outside project folder.
   - For **Push** or **Pull — interview**, try **LOG UPDATE** to paste a short status and click **✓ COMMIT UPDATE**.

When you see your project and its update on **BOARD**, Part 2 is complete.

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
