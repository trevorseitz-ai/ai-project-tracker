# Workflows in AI Project Tracker

This guide details how to use the core workflows of the AI Project Tracker: **Prep Agent**, **Push Reporter**, and **Pull Reporter**. Each section provides step-by-step instructions along with troubleshooting tips.

---

## Prep Agent Workflow

The **Prep Agent** audits your project and prepares it for seamless tracking.

### When to Use:
- Before integrating the tracker into a new project.
- To ensure your project meets the tracker’s prerequisites.

### Steps:
1. Navigate to your project directory.
2. Run the Prep Agent:
   ```bash
   npm run prep-agent
   ```
3. Check the generated `.tracker-config.json` file in the project root. This file contains the prepped project details.

### Troubleshooting:
- **Problem**: `npm run prep-agent` command not found.
  - **Solution**: Ensure you are inside the `self-hosted` directory, and all dependencies are installed using `npm install`.
- **Problem**: `.tracker-config.json` is not created.
  - **Solution**: Check the console for errors. Ensure the project has a README, version control, and other basic files.

---

## Push Reporter Workflow

The **Push Reporter** creates a fully pre-configured Python reporter and injects it directly into your project.

### When to Use:
- You have a prepped project and want to automate status updates.

### Steps:
1. Navigate to your project directory.
2. Run the Push Reporter:
   ```bash
   npm run push-reporter
   ```
3. Confirm that the `reporter.py` file is created in your project root.

### Troubleshooting:
- **Problem**: `npm run push-reporter` command not found.
  - **Solution**: Ensure you are inside the `self-hosted` directory and properly prepped the project.
- **Problem**: `reporter.py` is not created or missing fields.
  - **Solution**: Check that the `.tracker-config.json` file is present and not missing essential fields.

---

## Pull Reporter Workflow

The **Pull Reporter** inspects a project automatically or interacts with you to gather project details.

### Autonomous Mode:
- The Pull Reporter analyzes the following:
  - README
  - Git history
  - `package.json`, `requirements.txt`
  - TODO files

### Human-In-Loop Mode:
- The Pull Reporter asks a series of questions to gather project details interactively.

### Steps:
1. Navigate to your project directory.
2. Run the Pull Reporter:
   ```bash
   npm run pull-reporter
   ```
3. Select either **Autonomous Mode** or **Human-In-Loop Mode**.
4. Review and confirm the generated first update.

### Troubleshooting:
- **Problem**: The reporter fails to analyze the project.
  - **Solution**: Ensure the project directory contains common project files (e.g., README, git history).
- **Problem**: The interactive mode does not proceed.
  - **Solution**: Ensure Node.js is updated to version 18+.

---

This guide provides a concise overview of the workflows. For advanced troubleshooting, refer to the [Troubleshooting Guide](./TROUBLESHOOTING.md).