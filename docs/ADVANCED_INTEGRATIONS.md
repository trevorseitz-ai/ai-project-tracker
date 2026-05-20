# Advanced Integrations Guide

> **Not current documentation.** Examples here use CLI commands (`npm run prep-agent`) that **do not exist**. For live agent integration, use the [API Reference](./API_REFERENCE.md) and `POST /api/project-update`. See [Roadmap](./ROADMAP.md).

---

This document provides instructions for integrating the AI Project Tracker with advanced tools and workflows, including CI/CD pipelines, project management systems, and external notifications. These integrations enhance its functionality and adaptability to complex environments.

---

## CI/CD Integration

### Overview
Integrate the tracker with your Continuous Integration/Continuous Delivery (CI/CD) pipeline to automate updates and validations during code deployment.

### Example: GitHub Actions

**Step 1: Add a GitHub Actions Workflow**
1. Create a new workflow file in `.github/workflows/ai-tracker.yml`:
   ```yaml
   name: AI Project Tracker Integration

   on:
     push:
       branches:
         - main

   jobs:
     update-tracker:
       runs-on: ubuntu-latest

       steps:
         - name: Checkout Code
           uses: actions/checkout@v3

         - name: Set Up Node.js
           uses: actions/setup-node@v3
           with:
             node-version: "18"

         - name: Install Dependencies
           run: npm install

         - name: Run Prep Workflow
           run: npm run prep-agent

         - name: Push Updates to Tracker
           run: npm run push-reporter
   ```

**Step 2: Commit and Test Workflow**
1. Commit the file to your repository:
   ```bash
   git add .github/workflows/ai-tracker.yml
   git commit -m "Add AI Project Tracker GitHub Actions workflow"
   git push origin main
   ```
2. Open the GitHub Actions page in your repository and verify the workflow runs successfully.

### Example: Jenkins Pipeline

**Step 1: Add a Jenkinsfile**
1. Create a file named `Jenkinsfile` in your repository root:
   ```groovy
   pipeline {
       agent any

       stages {
           stage('Install Dependencies') {
               steps {
                   sh 'npm install'
               }
           }
           stage('Run Prep Agent') {
               steps {
                   sh 'npm run prep-agent'
               }
           }
           stage('Push Updates') {
               steps {
                   sh 'npm run push-reporter'
               }
           }
       }
   }
   ```
2. Configure Jenkins to use this pipeline for your repository.

---

## Project Management Tools Integration

### Example: JIRA Integration

**Step 1: Set Up JIRA Keys**
1. Generate an API token for JIRA from [Atlassian](https://id.atlassian.com/manage-profile/security/api-tokens).
2. Add the following keys to your `.env` file:
   ```plaintext
   JIRA_HOST=your-jira-instance.atlassian.net
   JIRA_EMAIL=your-email@example.com
   JIRA_TOKEN=your-api-token
   ```

**Step 2: Update the Reporter Logic**
1. Modify `reporter.py` to include a function for creating JIRA tickets:
   ```python
   import requests
   import json
   import os

   def create_jira_ticket(summary, description):
       jira_url = f"https://{os.environ['JIRA_HOST']}/rest/api/3/issue"
       auth = (os.environ['JIRA_EMAIL'], os.environ['JIRA_TOKEN'])
       headers = {"Content-Type": "application/json"}
       payload = {
           "fields": {
               "project": {"key": "PROJ"},
               "summary": summary,
               "description": description,
               "issuetype": {"name": "Task"}
           }
       }

       response = requests.post(jira_url, auth=auth, headers=headers, data=json.dumps(payload))
       if response.status_code == 201:
           print("JIRA ticket created successfully!")
       else:
           print(f"Failed to create JIRA ticket: {response.status_code}")
   ```

**Step 3: Test the Integration**
1. Run the reporter script with a test update.
2. Verify that a new task is created in JIRA.

### Example: Trello Integration

**Step 1: Set Up Trello API Keys**
1. Obtain your Trello API key and token from [Trello Developer Portal](https://trello.com/app-key).
2. Add the following keys to your `.env` file:
   ```plaintext
   TRELLO_KEY=your-trello-key
   TRELLO_TOKEN=your-trello-token
   ```

**Step 2: Update the Reporter Logic**
1. Modify `reporter.py` to create Trello cards:
   ```python
   def create_trello_card(card_name, description):
       board_id = "your-trello-board-id"
       url = f"https://api.trello.com/1/cards?idList={board_id}&key={os.environ['TRELLO_KEY']}&token={os.environ['TRELLO_TOKEN']}"
       payload = {"name": card_name, "desc": description}
       response = requests.post(url, data=payload)
       if response.status_code == 200:
           print("Trello card created successfully!")
       else:
           print(f"Failed to create Trello card: {response.status_code}")
   ```

**Step 3: Test the Integration**
- Run the reporter script and ensure new cards are added to the Trello board.

---

## External Notifications

### Slack Notifications

**Step 1: Set Up Slack Webhooks**
1. Create a new [Slack Incoming Webhook](https://api.slack.com/messaging/webhooks) and obtain the Webhook URL.
2. Add the Webhook URL to your `.env` file:
   ```plaintext
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxxx/xxxx/xxxx
   ```

**Step 2: Modify the Reporter Script**
- Update `reporter.py` to send Slack notifications:
  ```python
  def send_slack_notification(message):
      url = os.environ['SLACK_WEBHOOK_URL']
      payload = {"text": message}
      response = requests.post(url, json=payload)
      if response.status_code == 200:
          print("Slack notification sent successfully!")
      else:
          print(f"Failed to send notification: {response.status_code}")
  ```

**Step 3: Test Notifications**
- Trigger the Slack notification function and confirm updates appear in your Slack channel.

---

For additional integrations or issues, see [API Reference](./API_REFERENCE.md) or open a GitHub issue.