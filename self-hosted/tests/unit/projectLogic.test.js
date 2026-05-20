import { describe, it, expect } from "vitest";
import {
  commitUpdateToProjects,
  validateAgentUpdatePayload,
  normalizeAgentUpdate,
  getProjectStatus,
  uid,
} from "../../shared/projectLogic.js";

describe("projectLogic", () => {
  it("commitUpdateToProjects creates a project when missing", () => {
    const update = normalizeAgentUpdate({
      type: "daily",
      project: "New",
      summary: "Started work today",
      status: "Active",
    });
    const result = commitUpdateToProjects([], update, "Claude");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("New");
    expect(result[0].updates[0].summary).toBe("Started work today");
  });

  it("validateAgentUpdatePayload rejects invalid payloads", () => {
    expect(validateAgentUpdatePayload(null).ok).toBe(false);
    expect(validateAgentUpdatePayload({ type: "daily", project: "X", summary: "ok", status: "Hacked" }).ok).toBe(false);
    expect(
      validateAgentUpdatePayload({
        type: "daily",
        project: "X",
        summary: "Valid summary",
        status: "Active",
      }).ok
    ).toBe(true);
  });

  it("getProjectStatus returns project snapshot", () => {
    const update = normalizeAgentUpdate({
      type: "blocker",
      project: "Alpha",
      summary: "Build blocked on credentials",
      status: "Blocked",
      blockers: ["Need API key"],
      next_steps: ["Obtain key"],
    });
    const projects = commitUpdateToProjects([], update, "Claude");
    const status = getProjectStatus(projects, "Alpha");
    expect(status.project_name).toBe("Alpha");
    expect(status.status).toBe("Blocked");
    expect(status.blockers).toContain("Need API key");
    expect(status.last_update).toBeTruthy();
  });

  it("normalizeAgentUpdate assigns id and timestamp", () => {
    const update = normalizeAgentUpdate({
      type: "progress",
      project: "Alpha",
      summary: "Made progress today",
      status: "Active",
    });
    expect(update.id).toBeTruthy();
    expect(update.timestamp).toBeTruthy();
    expect(update.confidence).toBe(0.8);
  });

  it("commitUpdateToProjects prepends updates", () => {
    const first = normalizeAgentUpdate({
      type: "daily",
      project: "Alpha",
      summary: "First update logged",
      status: "Active",
    });
    const second = normalizeAgentUpdate({
      type: "progress",
      project: "Alpha",
      summary: "Second update logged",
      status: "Active",
    });
    let projects = commitUpdateToProjects([], first, "Claude");
    projects = commitUpdateToProjects(projects, second, "Claude");
    expect(projects[0].updates[0].summary).toBe("Second update logged");
    expect(projects[0].updates[1].summary).toBe("First update logged");
    expect(projects[0].updates[0].id).not.toBe(projects[0].updates[1].id);
    expect(uid()).toMatch(/^[a-z0-9]+$/);
  });
});
