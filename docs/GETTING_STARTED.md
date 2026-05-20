# Getting Started with AI Project Tracker

This guide walks you through setting up the AI Project Tracker step-by-step. Follow the steps in order without skipping ahead. If something goes wrong, each section includes troubleshooting tips to help you resolve issues quickly.

---

## Step 1: Cloning the Repository

The first step is to get a copy of the repository on your local machine.

### Instructions:
1. Open your terminal.
2. Clone the repository:
   ```bash
   git clone https://github.com/trevorseitz-ai/ai-project-tracker.git
   ```
3. Navigate into the project directory:
   ```bash
   cd ai-project-tracker
   ```

### Troubleshooting:
- **Problem**: `git` is not recognized as a command.
  - **Solution**: [Install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).
- **Problem**: Permission denied when cloning.
  - **Solution**: Ensure you have access to the repository. If it's private, check your GitHub authentication.

---

## Step 2: Installing Dependencies

Installing the required dependencies is critical for running the project.

### Instructions:
1. Navigate to the `self-hosted` directory:
   ```bash
   cd self-hosted
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Troubleshooting:
- **Problem**: `npm` is not recognized as a command.
  - **Solution**: Ensure [Node.js](https://nodejs.org/) is installed, which includes `npm`.
- **Problem**: Installation errors due to missing packages.
  - **Solution**: Run `npm cache clean --force` and retry `npm install`.

---

## Step 3: Configuring Environment Variables

The app requires an API key for full functionality.

### Instructions:
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Open the `.env` file in a text editor and set:

   ```plaintext
   VITE_ANTHROPIC_API_KEY=your-api-key-here
   VITE_TRACKER_URL=http://localhost:3000/api/project-update
   VITE_AGENT_KEY=dev-agent-key
   ```

   See `.env.example` for descriptions. Change `VITE_AGENT_KEY` before exposing the tracker to a network.
3. Save the file and close the editor.

### Troubleshooting:
- **Problem**: You don't have an API key.
  - **Solution**: Generate a key from the [Anthropic Console](https://console.anthropic.com/keys).

---

## Step 4: Starting the Application

### Instructions:
1. Start both the API server and the UI:
   ```bash
   npm run dev
   ```
   This runs the Express API on port **3001** and Vite on port **3000** (API proxied at `/api`).

2. Open your browser:
   [http://localhost:3000](http://localhost:3000)

### Troubleshooting:
- **Problem**: The server doesn't start.
  - **Solution**: Check the terminal for errors. Ensure ports 3000 and 3001 are free.
- **Problem**: UI loads but agent POSTs fail / board doesn't sync.
  - **Solution**: Don't use `npm run dev:client` alone — the API must be running (`npm run dev` or `npm run dev:server` in another terminal).
- **Problem**: Cannot connect to `localhost`.
  - **Solution**: Ensure no other applications are using port 3000.

---

## Step 5: Set Up Your First Project

The app is running — next, add a tracked project and log your first update.

### Instructions

1. Open [http://localhost:3000](http://localhost:3000).
2. On the **BOARD** tab, type a project name and click **+ ADD**, **or** use **LOG UPDATE** to paste a work summary and commit a parsed update.
3. Continue with [Your First Project](./FIRST_PROJECT.md) for the full walkthrough (manual logging vs connecting an external repo with Prep and Reporter agents).

---

You've completed the initial setup! For agent workflows, see [Workflows](./WORKFLOWS.md). If you encounter issues, refer to the [Troubleshooting Guide](./TROUBLESHOOTING.md).
