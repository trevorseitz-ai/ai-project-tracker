# Installation Guide

This document provides a step-by-step guide for installing and running the AI Project Tracker.

---

## Prerequisites
### Software Requirements
- **Node.js 18+**: [Download and install Node.js](https://nodejs.org/)
- **npm**: Comes bundled with Node.js.

### Account Requirements
- **Anthropic API Key**: Required for the self-hosted version. Obtain it from the [Anthropic Console](https://console.anthropic.com/keys).

### Optional
- **Claude.ai Subscription**: If you choose the Claude Artifact setup.

---

## Installation Options
### Option A: Claude Artifact (No Setup Required)
1. Navigate to [claude.ai](https://claude.ai).
2. Copy the contents of the `claude-artifact/App.jsx` file from this repository.
3. Paste the content into a new message on Claude.ai, asking it to render it as a React artifact.
4. The app will run immediately — no API key or further setup is required.

### Option B: Self-Hosted Setup (Local or Deployed)
#### Step 1: Clone the Repository
Open your terminal and run the following command:
```bash
git clone https://github.com/trevorseitz-ai/ai-project-tracker.git
```
Change into the project directory:
```bash
cd ai-project-tracker/self-hosted
```

#### Step 2: Install Dependencies
Install the required dependencies:
```bash
npm install
```

#### Step 3: Configure Environment Variables
Copy the example environment file and update it:
```bash
cp .env.example .env
```
Edit the `.env` file to add your Anthropic API key:
```plaintext
ANTHROPIC_API_KEY=your-api-key-here
```

#### Step 4: Start the Development Server
Run the app locally:
```bash
npm run dev
```
Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

---

## Troubleshooting
### Common Issues
1. **Node.js Version Errors**:
   - Ensure you have Node.js 18 or higher installed.
2. **Dependency Installation Fails**:
   - Run `npm cache clean --force` and retry `npm install`.
3. **Server Doesn’t Start**:
   - Double-check your `.env` file for the correct API key.

### Need More Help?
Check out the [Troubleshooting Guide](./TROUBLESHOOTING.md) for more details.

---

You’re now ready to use the AI Project Tracker!