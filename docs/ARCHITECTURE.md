# Code Architecture Documentation

This document provides an overview of the code organization, key components, and interaction flow within the AI Project Tracker. Understanding this architecture will help contributors and users extend and adapt the project seamlessly.

---

## Introduction

The AI Project Tracker is designed to seamlessly integrate into various AI projects. By organizing the code into modular components, the system ensures simplicity in workflow execution and extensibility. This guide explains the architecture and highlights the essential parts of the codebase.

---

## Folder Structure

Here’s the high-level directory structure of the AI Project Tracker:

```
ai-project-tracker/
|-- src/
|   |-- agents/
|   |   |-- prepAgent.js
|   |   |-- pushReporter.js
|   |   |-- pullReporter.js
|-- tests/
|   |-- agents.test.js
|   |-- workflows.test.js
|-- docs/
|   |-- GETTING_STARTED.md
|   |-- TROUBLESHOOTING.md
|-- .tracker-config.json
|-- package.json
|-- README.md
|-- .env.example
```

### Explanation of Directories:
- **`src`**: Contains the main source code for agents and workflow logic.
  - `agents/` houses the implementation of Prep, Push, and Pull workflows.
- **`tests`**: Contains unit and integration tests to validate each workflow.
- **`docs`**: Stores documentation files for setup, troubleshooting, and other guides.
- **Root Files**:
  - `.tracker-config.json`: Stores configuration details for projects prepared using the tracker.
  - `.env.example`: An example environment configuration file.
  - `package.json`: Lists dependencies and scripts for managing the Node.js environment.

---

## Key Components

### 1. Prep Agent
**Purpose**: Prepares a project for tracking by creating a `.tracker-config.json` file.
- **Location**: `src/agents/prepAgent.js`
- **Primary Tasks**:
  - Audits the project directory.
  - Extracts metadata from the `README` and `package.json` (if applicable).
  - Generates `.tracker-config.json`.

### 2. Push Reporter
**Purpose**: Adds a reporting agent (e.g., `reporter.py`) to the project.
- **Location**: `src/agents/pushReporter.js`
- **Primary Tasks**:
  - Creates or modifies a `reporter.py` file in the project directory.
  - Provides customizable templates for the reporter.

### 3. Pull Reporter
**Purpose**: Analyzes projects and pulls status updates automatically or interactively.
- **Location**: `src/agents/pullReporter.js`
- **Primary Tasks**:
  - Gathers project updates (e.g., progress, blockers).
  - Has autonomous and human-in-loop modes.

---

## Interaction Flow

### Workflow Execution
1. **Prep Agent**:
   - Initializes project tracking by auditing the project.
   - Outputs `.tracker-config.json` for use during Push and Pull workflows.
2. **Push Agent**:
   - Injects required scripts (e.g., `reporter.py`) into the project.
   - Uses details from `.tracker-config.json`.
3. **Pull Agent**:
   - Inspects and reports project status based on logs or manual input.

### Data Flow
```
Project Files --> [Prep Agent] --> .tracker-config.json --> [Push Reporter] --> reporter.py --> [Pull Reporter] --> Status Updates
```

---

## Extensibility

The AI Project Tracker is built to be flexible and extendable. Here’s how:

### Adding New Workflows
1. Create a new file in `src/agents/` (e.g., `newWorkflow.js`).
2. Register the workflow in `package.json` under the `scripts` section.
   ```json
   "new-workflow": "node src/agents/newWorkflow.js"
   ```
3. Document the workflow in `docs/`.

### Modifying Existing Components
- Update logic in scripts under `src/agents/` as needed.
- Ensure that changes are tested using `tests/`.

---

## Technologies Used

- **Node.js**: Backend runtime for executing agents.
- **Python**: Reporter scripts are implemented in Python for cross-platform compatibility.
- **JSON**: Configuration management using `.tracker-config.json`.

---

For further support, refer to the [Testing Guide](./TESTING.md) and [Troubleshooting Guide](./TROUBLESHOOTING.md).