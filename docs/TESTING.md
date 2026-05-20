# Testing Guide

This document provides a comprehensive guide on how to test the Prep, Push, and Pull workflows of the AI Project Tracker. Testing ensures stability and reliability of the application across different environments and use cases.

---

## Prerequisites
Before you begin testing, ensure the following:
- All dependencies are installed:
  ```bash
  npm install
  ```
- You have completed the setup steps as outlined in the [Getting Started Guide](./GETTING_STARTED.md).
- You have access to a test project for running workflows.

---

## Testing the Prep Workflow

### Purpose:
To ensure the Prep Agent correctly parses and prepares your project for tracking.

### Steps:
1. **Create a Test Project**:
   - Include a minimal README file and a version-controlled repository (e.g., Git).
2. **Run the Prep Agent**:
   ```bash
   npm run prep-agent
   ```
3. **Verify Output**:
   - Check if the `.tracker-config.json` file is generated.
   - Confirm it includes fields like `project_name`, `model_used`, and `stack`. Example:
     ```json
     {
       "project_name": "Test Project",
       "model_used": "Test Model",
       "stack": ["Node.js", "React"]
     }
     ```
4. **Inspect Logs**:
   - Verify the terminal output for errors or warnings.

### Automated Testing:
If the Prep workflow is automated:
```bash
npm test prep-workflow
```
This runs all associated unit tests.

### Troubleshooting:
- **Problem**: `.tracker-config.json` is not created.
  - **Solution**: Ensure the test project includes a README and is under version control.
- **Problem**: Missing fields.
  - **Solution**: Check the Prep Agent script and manually add fields to the `.tracker-config.json`.

---

## Testing the Push Workflow

### Purpose:
To ensure the Push Reporter integrates seamlessly into a project and generates the appropriate reporting script.

### Steps:
1. **Run the Push Reporter**:
   ```bash
   npm run push-reporter
   ```
2. **Verify Output**:
   - Check if the `reporter.py` file is created in the project root.
   - Inspect the contents of `reporter.py` for the correct fields (e.g., `type`, `project`, `status`).
3. **Simulate a Push**:
   - Test running the Reporter script manually:
     ```bash
     python reporter.py
     ```
   - Confirm that it sends a dummy update (mock API call).

### Automated Testing:
Run unit tests for the Push workflow:
```bash
npm test push-workflow
```

### Troubleshooting:
- **Problem**: Reporter script is not generated.
  - **Solution**: Ensure the Prep workflow was successfully completed first.
- **Problem**: Mock API call throws errors.
  - **Solution**: Verify the webhook URL or API endpoint configuration in the script.

---

## Testing the Pull Workflow

### Purpose:
To ensure the Pull Reporter accurately retrieves and structures updates from a project.

### Steps:
1. **Run the Pull Reporter**:
   ```bash
   npm run pull-reporter
   ```
2. **Choose a Mode**:
   - **Autonomous Mode**: Ensure updates are automatically inferred.
   - **Human-In-Loop Mode**: Ensure all required questions are prompted and responses are logged correctly.
3. **Verify Updates**:
   - Check for the correct structure in the update logs. Example:
     ```json
     {
       "type": "progress",
       "project": "Test Project",
       "status": "Active",
       "blockers": [],
       "next_steps": ["Complete milestone"]
     }
     ```

### Automated Testing:
Run unit tests for the Pull workflow:
```bash
npm test pull-workflow
```

### Troubleshooting:
- **Problem**: Reporter fails to infer updates.
  - **Solution**: Verify that the project directory includes standard files (e.g., `README`, `package.json`, `requirements.txt`).
- **Problem**: Questions are incomplete in Human-In-Loop Mode.
  - **Solution**: Update the question logic in the Pull Reporter script.

---

## General Testing Tips
- Use a **controlled test project** for consistent results.
- Run workflows in **different environments** to test stability (e.g., Linux, Windows, and Mac).
- Enable **verbose logging** to identify hidden errors by modifying the `scripts` section in `package.json` to include `--verbose`.

Example:
```bash
npm run prep-agent --verbose
```

---

This concludes the testing guide. For additional support, refer to the [Troubleshooting Guide](./TROUBLESHOOTING.md) or open an issue on GitHub.