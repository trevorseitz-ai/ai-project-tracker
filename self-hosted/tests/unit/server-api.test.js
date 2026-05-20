import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs/promises";
import os from "os";
import path from "path";
import request from "supertest";
import { createApp, getAgentKey } from "../../server/index.js";

describe("server API", () => {
  let tempDir;
  let app;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "tracker-api-"));
    process.env.DATA_DIR = tempDir;
    process.env.AGENT_KEY = "test-agent-key";
    app = createApp();
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
    delete process.env.DATA_DIR;
    delete process.env.AGENT_KEY;
  });

  it("accepts POST /api/project-update with valid agent key", async () => {
    const res = await request(app)
      .post("/api/project-update")
      .set("X-Agent-Key", getAgentKey())
      .send({
        type: "daily",
        project: "Webhook Project",
        summary: "Agent posted an update successfully",
        detail: "Testing webhook receiver",
        status: "Active",
        confidence: 0.95,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/received successfully/i);

    const projects = await request(app).get("/api/projects");
    expect(projects.body.some(p => p.name === "Webhook Project")).toBe(true);
  });

  it("rejects POST /api/project-update without agent key", async () => {
    const res = await request(app).post("/api/project-update").send({
      type: "daily",
      project: "X",
      summary: "Should fail without key",
      status: "Active",
    });
    expect(res.status).toBe(401);
  });

  it("returns project status for GET /api/project-status", async () => {
    await request(app)
      .post("/api/project-update")
      .set("X-Agent-Key", getAgentKey())
      .send({
        type: "blocker",
        project: "Status Project",
        summary: "Blocked waiting on dependency",
        status: "Blocked",
        blockers: ["Waiting on API"],
      });

    const res = await request(app)
      .get("/api/project-status")
      .query({ project: "Status Project" })
      .set("X-Agent-Key", getAgentKey());

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Blocked");
    expect(res.body.project_name).toBe("Status Project");
  });

  it("syncs full project list via PUT /api/projects", async () => {
    const payload = [
      {
        id: "p1",
        name: "Synced Project",
        status: "Active",
        model: "Claude",
        updates: [
          {
            id: "u1",
            timestamp: new Date().toISOString(),
            type: "daily",
            summary: "Synced from UI",
          },
        ],
      },
    ];

    const put = await request(app).put("/api/projects").send(payload);
    expect(put.status).toBe(200);

    const get = await request(app).get("/api/projects");
    expect(get.body).toEqual(payload);
  });
});
