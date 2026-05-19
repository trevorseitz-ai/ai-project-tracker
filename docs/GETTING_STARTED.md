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
  - **Solution**: Ensure you have access to the repository. If it’s private, check your GitHub authentication.

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
2. Open the `.env` file in a text editor and add your Anthropic API key:
   ```plaintext
   ANTHROPIC_API_KEY=your-api-key-here
   ```
3. Save the file and close the editor.

### Troubleshooting:
- **Problem**: You don’t have an API key.
  - **Solution**: Generate a key from the [Anthropic Console](https://console.anthropic.com/keys).

---

## Step 4: Starting the Application

### Instructions:
1. Run the development server:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to:
   [http://localhost:3000](http://localhost:3000)

### Troubleshooting:
- **Problem**: The server doesn’t start.
  - **Solution**: Check the console for errors and ensure all previous steps were completed.
- **Problem**: Cannot connect to `localhost`.
  - **Solution**: Ensure no other applications are using port 3000.

---

You’ve now completed the initial setup and can start using the AI Project Tracker! If you encounter additional issues, refer to the [Troubleshooting Guide](./TROUBLESHOOTING.md).