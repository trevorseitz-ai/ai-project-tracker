# Examples Guide

This guide provides real-world use cases for the AI Project Tracker to help you adapt it to your projects. Whether you’re working on software development, data pipelines, or integrating multiple models, these examples will guide you through common setups.

---

## Introduction
The following examples demonstrate how to implement the AI Project Tracker in different scenarios. Each example highlights the Prep, Push, and Pull workflows and includes troubleshooting tips to ensure a smooth experience.

---

## Example 1: Software Development Project

### Scenario:
You’re managing a Python-based AI project using GPT-4 and LangChain for NLP tasks. The project repository includes version control, a README file, and dependencies defined in `requirements.txt`.

### Workflow:
1. **Run the Prep Agent**:
   ```bash
   npm run prep-agent
   ```
2. **Push the Reporter**:
   ```bash
   npm run push-reporter
   ```
3. **Verify the Workflow**:
   - Check that `.tracker-config.json` has been generated and includes:
     ```json
     {
       "project_name": "Python NLP Project",
       "model_used": "GPT-4",
       "stack": ["Python", "LangChain"]
     }
     ```
   - Confirm that `reporter.py` was added to the project root.

### Troubleshooting:
- **Problem**: Prep Agent does not recognize dependencies.
  - **Solution**: Ensure `requirements.txt` exists with proper formatting.
- **Problem**: Reporter is missing fields like `model_used`.
  - **Solution**: Update the `.tracker-config.json` manually or rerun the Prep Agent.

---

## Example 2: Data Science Pipeline

### Scenario:
You’re tracking progress in a data science pipeline using R and Python. Projects are stored as Jupyter Notebooks, and output files are logged in `results/`.

### Workflow:
1. **Prep the Data Science Project**:
   ```bash
   npm run prep-agent
   ```
2. **Pull Updates Automatically**:
   - Generate a Pull Reporter to inspect the `results/` directory and infer status updates:
     ```bash
     npm run pull-reporter
     ```
3. **Review and Validate the Updates**:
   - Ensure updates are parsed correctly:
     ```json
     {
       "type": "progress",
       "status": "Active",
       "blockers": [],
       "next_steps": ["Generate final report"]
     }
     ```

### Troubleshooting:
- **Problem**: Pull Reporter does not detect the `results/` directory.
  - **Solution**: Check that the directory path is correct and contains valid output.
- **Problem**: Updates are incomplete or incorrect.
  - **Solution**: Use Human-In-Loop mode for better context gathering.

---

## Example 3: Multi-Model Coordination

### Scenario:
You’re managing a project leveraging Claude AI for text summarization and GPT-4 for chatbot features.

### Workflow:
1. **Prepare the Coordination Project**:
   Run the Prep Agent and verify the `.tracker-config.json`:
   ```bash
   npm run prep-agent
   ```

2. **Push and Pull Updates**:
   - Push a Reporter to each model’s respective project:
     ```bash
     npm run push-reporter
     ```
   - Use the Pull Reporter with Human-In-Loop mode to gather updates for the overall project coordination.

3. **Integrate Updates**:
   - Manually merge updates from both models into a master project board.

### Troubleshooting:
- **Problem**: `prep-agent` fails due to missing interdependencies.
  - **Solution**: Ensure shared settings or dependencies are well-defined in both projects.

---

## Common Adjustments for Niche Scenarios

1. **Adding Custom Fields**:
   - Modify `.tracker-config.json` to include fields unique to your project.
2. **Adjusting Pull Reporter Behaviors**:
   - Specify directories or files to ignore in the reporter’s source code.

### Troubleshooting:
- **Problem**: New fields are not recognized.
  - **Solution**: Ensure all workflows are updated to handle custom fields.

---

This concludes the example use cases for the AI Project Tracker. For additional support, refer to the [Troubleshooting Guide](./TROUBLESHOOTING.md) or open an issue on GitHub.