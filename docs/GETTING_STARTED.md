# Getting Started

Follow these steps **in order** to install and open the AI Project Tracker.

**What you need:** a computer with [Node.js](https://nodejs.org/) installed, and an [Anthropic API key](https://console.anthropic.com/keys) (free tier works for testing).

---

## Step 1: Download the project

1. Open **Terminal** (Mac) or **Command Prompt** (Windows).
2. Run:

```bash
git clone https://github.com/trevorseitz-ai/ai-project-tracker.git
cd ai-project-tracker/self-hosted
```

**If `git` is not found:** install Git from [git-scm.com](https://git-scm.com/).

---

## Step 2: Install packages

Still in the `self-hosted` folder, run:

```bash
npm install
```

This downloads the code libraries the app needs. It may take a minute.

**If `npm` is not found:** install Node.js from [nodejs.org](https://nodejs.org/) — npm comes with it.

---

## Step 3: Set up your API key

1. Copy the example settings file:

```bash
cp .env.example .env
```

2. Open `.env` in any text editor (Notepad, VS Code, etc.).
3. Paste your Anthropic key on this line:

```plaintext
VITE_ANTHROPIC_API_KEY=sk-ant-paste-your-real-key-here
```

4. Leave these two lines as they are for local use:

```plaintext
VITE_TRACKER_URL=http://localhost:3000/api/project-update
VITE_AGENT_KEY=dev-agent-key
```

5. Save the file.

---

## Step 4: Start the app

In the same folder, run:

```bash
npm run dev
```

Wait until you see messages for both **api** and **web**. Leave this window open — closing it stops the app.

Open your browser and go to: **[http://localhost:3000](http://localhost:3000)**

---

## Step 5: Use the app

Setup is done. Continue to **[Your First Project](./FIRST_PROJECT.md)** to add a project and log an update.

---

## Common problems

| Problem | What to try |
|---------|-------------|
| `git` or `npm` not found | Install Git or Node.js (see links above) |
| Page won't load | Make sure `npm run dev` is still running |
| AI buttons don't work | Check your API key in `.env`, save the file, stop the app (Ctrl+C), run `npm run dev` again |
| Port already in use | Close other apps using port 3000, or restart your computer |

More help: [Troubleshooting](./TROUBLESHOOTING.md)
