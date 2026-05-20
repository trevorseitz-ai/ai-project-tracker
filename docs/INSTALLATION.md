# Installation (other options)

> **Most users:** use [Getting Started](./GETTING_STARTED.md) instead.  
> This page is only for the **no-install** Claude version or **production** hosting.

---

## Option A: Run inside Claude.ai (no install)

Good if you do not want to install Node.js or use an API key.

1. Go to [claude.ai](https://claude.ai).
2. Open the file `claude-artifact/App.jsx` in this repository.
3. Copy all of it into a Claude chat.
4. Ask Claude to show it as a React artifact.

**Note:** Data disappears when you close the chat. There is no save file.

---

## Option B: Self-hosted (normal install)

This is the same as [Getting Started](./GETTING_STARTED.md):

```bash
git clone https://github.com/trevorseitz-ai/ai-project-tracker.git
cd ai-project-tracker/self-hosted
npm install
cp .env.example .env
# Edit .env — add your VITE_ANTHROPIC_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Then continue to [Your First Project](./FIRST_PROJECT.md).

---

## Option C: Production (host on a server)

For teachers, clubs, or hosting on a real server:

```bash
cd self-hosted
npm install
cp .env.example .env
# Edit .env with your real keys
npm run build
npm start
```

The app and API run together on port **3000** (change with `PORT=` in your environment).

**Before sharing on the internet:** change `VITE_AGENT_KEY` from `dev-agent-key` to something secret.

More detail: [Architecture](./ARCHITECTURE.md) and [Roadmap](./ROADMAP.md).

---

## What the npm commands do

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start app for everyday use (recommended) |
| `npm run build` | Build files for production |
| `npm start` | Run production server |
| `npm test` | Run automated tests |

---

## Common problems

| Problem | What to try |
|---------|-------------|
| Node too old | Install Node 18 or newer |
| AI buttons fail | Check `VITE_ANTHROPIC_API_KEY` in `.env` |
| Board out of sync | Use `npm run dev`, not `npm run dev:client` alone |

[Full troubleshooting →](./TROUBLESHOOTING.md)
