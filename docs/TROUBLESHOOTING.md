# Troubleshooting Guide

This document provides solutions to common issues you may encounter while using the AI Project Tracker. It is organized by setup and workflows.

---

## Issues During Setup

### Cloning the Repository
**Problem**: `Permission denied (publickey)` when cloning the repository.
- **Solution**: Verify that your SSH key is added to your GitHub account. Alternatively, use the HTTPS URL to clone the repository:
  ```bash
  git clone https://github.com/trevorseitz-ai/ai-project-tracker.git
  ```

**Problem**: `git` is not recognized as a command.
- **Solution**: Install Git from [here](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).

### Installing Dependencies
**Problem**: Dependency installation fails with errors about incompatible Node.js versions.
- **Solution**: Ensure you are using Node.js version 18 or higher. You can check your version with:
  ```bash
  node -v
  ```
  To install the recommended version, visit [Node.js Downloads](https://nodejs.org/).

**Problem**: `npm install` hangs or exits with network errors.
- **Solution**:
  - Clear npm’s cache:
    ```bash
    npm cache clean --force
    ```
  - Retry `npm install`.
  - Check your network connection and proxy settings.

### Starting the Application
**Problem**: `Error: missing .env file`.
- **Solution**: Ensure you’ve created the `.env` file:
  ```bash
  cp .env.example .env
  ```
  Add your API key in the format:
  ```plaintext
  ANTHROPIC_API_KEY=your-api-key-here
  ```

**Problem**: Nothing loads at [http://localhost:3000](http://localhost:3000).
- **Solution**:
  - Check the terminal for error messages.
  - Ensure no other processes are using port 3000. If port conflicts occur, terminate the other process.

---

## Workflow-Specific Issues

### Prep Agent Issues
**Problem**: `Prep Agent failed: missing README`.
- **Solution**: Add a README file to your project root and retry.

**Problem**: No `.tracker-config.json` is generated.
- **Solution**: Ensure your project has the required files (README, git history, etc.). Check the console logs for detailed errors.

### Push Reporter Issues
**Problem**: `Push Reporter failed: missing .tracker-config.json`.
- **Solution**: Ensure the Prep Agent successfully generated `.tracker-config.json`.

**Problem**: `reporter.py` file is not created.
- **Solution**: Verify write permissions for the project directory and check the console for errors.

### Pull Reporter Issues
**Problem**: Pull Reporter fails to analyze the project.
- **Solution**: Ensure the project folder contains standard files like `README` and `package.json`. For Python projects, ensure `requirements.txt` is present.

**Problem**: Interactive mode does not proceed.
- **Solution**: Update Node.js to the latest version supported by the tracker, and retry.

---

## General
**Problem**: `EACCES` permission errors during commands.
- **Solution**:
  - Use `sudo` for administrative privileges (Linux/Mac):
    ```bash
    sudo npm install
    ```
  - On Windows, run the terminal as Administrator.

**Problem**: Application crashes with stack trace related to Node.js modules.
- **Solution**: Reinstall dependencies to ensure they're correctly installed:
  ```bash
  npm ci
  ```

**Problem**: You’re stuck and can’t find the issue.
- **Solution**: Open an issue on the [GitHub repository](https://github.com/trevorseitz-ai/ai-project-tracker/issues) and provide details including:
  - Steps to reproduce the problem.
  - Error logs or screenshots.
  - Your system environment (OS, Node.js version).

---

For additional support, please refer to the [FAQs](./FAQs.md).