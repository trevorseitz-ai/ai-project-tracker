# API Reference

This document provides details on the API endpoints exposed by the AI Project Tracker. Use this reference to integrate the tracker into your workflows and applications.

---

## Base URL
- For self-hosted deployments: `http://localhost:3000`
- For production deployments: Replace `localhost` with your hosted domain (e.g., `https://tracker.example.com`).

---

## Endpoints

### 1. `POST /api/project-update`
#### Description:
Endpoint for sending project updates to the tracker.

#### Request Body:
```json
{
  "type": "feature|tool|daily|blocker|progress",
  "project": "project name",
  "summary": "one clear sentence",
  "detail": "full description",
  "model_used": "AI model or service",
  "status": "Active|Blocked|Stalled|Complete",
  "blockers": ["..."],
  "next_steps": ["..."],
  "confidence": 0.0,
  "missing_fields": ["..."]
}
```

#### Headers:
- `Content-Type: application/json`
- `X-Agent-Key: your-agent-key`

#### Response:
- **200 OK**: The update was successfully logged.
  ```json
  {
    "message": "Update received successfully."
  }
  ```
- **400 Bad Request**: Missing or invalid fields.
  ```json
  {
    "error": "Invalid request body."
  }
  ```
- **401 Unauthorized**: Invalid or missing agent key.

#### Example:
```bash
curl -X POST http://localhost:3000/api/project-update \  
-H "Content-Type: application/json" \  
-H "X-Agent-Key: my-agent-key" \  
-d '{
  "type": "feature",
  "project": "AI Tracker",
  "summary": "Integrated a new Slack notification feature.",
  "detail": "Slack notifications are now sent for all blockers.",
  "model_used": "ChatGPT",
  "status": "Active",
  "blockers": [],
  "next_steps": ["Test notifications"],
  "confidence": 1.0,
  "missing_fields": []
}'
```

---

### 2. `GET /api/project-status`
#### Description:
Retrieve the current status of a project being tracked.

#### Parameters:
- **Query**:
  - `project`: The name of the project (required).

#### Headers:
- `X-Agent-Key: your-agent-key`

#### Response:
- **200 OK**: Project status returned successfully.
  ```json
  {
    "project_name": "AI Tracker",
    "status": "Active",
    "blockers": ["Integration tests failing"],
    "next_steps": ["Fix failing tests"],
    "last_update": "2026-05-10T12:34:00.000Z"
  }
  ```
- **404 Not Found**: The requested project does not exist.
- **401 Unauthorized**: Invalid or missing agent key.

#### Example:
```bash
curl -X GET http://localhost:3000/api/project-status?project=AI+Tracker \  
-H "X-Agent-Key: my-agent-key"
```

---

## Troubleshooting

### Common Issues
**Problem**: `401 Unauthorized` when calling an endpoint.
- **Solution**: Ensure the `X-Agent-Key` header is included and contains a valid key.

**Problem**: `400 Bad Request` when sending a project update.
- **Solution**: Double-check the request body for missing or invalid fields. Use the example JSON as a template.

**Problem**: `404 Not Found` for `GET /api/project-status`.
- **Solution**: Verify that the project name exists in the tracker and is spelled correctly.

For further assistance, see the [Troubleshooting Guide](./TROUBLESHOOTING.md).