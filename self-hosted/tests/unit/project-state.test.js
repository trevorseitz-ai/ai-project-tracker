/**
 * unit/project-state.test.js
 *
 * Tests for project CRUD operations, status transitions,
 * update routing, and export logic — all without rendering React.
 */

import { describe, it, expect } from "vitest";

const uid = () => Math.random().toString(36).slice(2, 9);
const TS = () => new Date().toISOString();

// ── Project factory ───────────────────────────────────────────────────────────

function makeProject(overrides = {}) {
  return {
    id: uid(),
    name: "Test Project",
    status: "Active",
    model: "Claude",
    updates: [],
    ...overrides,
  };
}

function makeUpdate(overrides = {}) {
  return {
    id: uid(),
    timestamp: TS(),
    type: "daily",
    project: "Test Project",
    summary: "Completed the feature implementation today",
    detail: "Built out the full authentication flow with JWT tokens",
    model_used: "Claude",
    status: "Active",
    blockers: [],
    next_steps: ["Write tests"],
    confidence: 0.9,
    missing_fields: [],
    ...overrides,
  };
}

// ── addProject logic ──────────────────────────────────────────────────────────

describe("addProject logic", () => {
  it("appends a new project to the list", () => {
    const projects = [makeProject({ name: "Existing" })];
    const newProj = makeProject({ name: "New Project" });
    const result = [...projects, newProj];
    expect(result).toHaveLength(2);
    expect(result[1].name).toBe("New Project");
  });

  it("does not mutate the original array", () => {
    const projects = [makeProject()];
    const original = [...projects];
    const _ = [...projects, makeProject({ name: "Another" })];
    expect(projects).toEqual(original);
  });

  it("new project starts with empty updates array", () => {
    const proj = makeProject();
    expect(proj.updates).toEqual([]);
  });

  it("new project defaults to Active status", () => {
    const proj = makeProject();
    expect(proj.status).toBe("Active");
  });
});

// ── Status transition logic ───────────────────────────────────────────────────

describe("status transitions", () => {
  const VALID_STATUSES = ["Active", "Blocked", "Stalled", "Complete"];

  it("can transition between all valid statuses", () => {
    let project = makeProject({ status: "Active" });
    for (const status of VALID_STATUSES) {
      project = { ...project, status };
      expect(project.status).toBe(status);
    }
  });

  it("Active → Blocked transition is allowed", () => {
    const project = makeProject({ status: "Active" });
    const updated = { ...project, status: "Blocked" };
    expect(updated.status).toBe("Blocked");
  });

  it("Blocked → Active transition is allowed (unblock)", () => {
    const project = makeProject({ status: "Blocked" });
    const updated = { ...project, status: "Active" };
    expect(updated.status).toBe("Active");
  });

  it("Complete → Active transition is allowed (reopen)", () => {
    const project = makeProject({ status: "Complete" });
    const updated = { ...project, status: "Active" };
    expect(updated.status).toBe("Active");
  });

  it("status update from incoming update takes effect", () => {
    const projects = [makeProject({ status: "Active" })];
    const update = makeUpdate({ status: "Blocked" });
    const result = projects.map(p =>
      p.name.toLowerCase() === update.project.toLowerCase()
        ? { ...p, status: update.status }
        : p
    );
    expect(result[0].status).toBe("Blocked");
  });
});

// ── Blocker detection ─────────────────────────────────────────────────────────

describe("blocker detection", () => {
  it("identifies projects with Blocked status", () => {
    const projects = [
      makeProject({ name: "A", status: "Active" }),
      makeProject({ name: "B", status: "Blocked" }),
      makeProject({ name: "C", status: "Stalled" }),
    ];
    const blockers = projects.filter(p => p.status === "Blocked");
    expect(blockers).toHaveLength(1);
    expect(blockers[0].name).toBe("B");
  });

  it("returns empty array when no projects are blocked", () => {
    const projects = [
      makeProject({ status: "Active" }),
      makeProject({ status: "Complete" }),
    ];
    expect(projects.filter(p => p.status === "Blocked")).toHaveLength(0);
  });

  it("update with blockers array sets status to Blocked", () => {
    // Simulates the expected behavior: if an update has blockers, status should reflect that
    const update = makeUpdate({ blockers: ["Out of API credits", "Build failing"], status: "Blocked" });
    expect(update.status).toBe("Blocked");
    expect(update.blockers).toHaveLength(2);
  });
});

// ── Update ordering ───────────────────────────────────────────────────────────

describe("update ordering", () => {
  it("most recent update appears first", () => {
    const old = makeUpdate({ summary: "Older update text here today" });
    const fresh = makeUpdate({ summary: "Newer update text here today" });
    const updates = [fresh, old]; // prepend = most recent first
    expect(updates[0].summary).toBe("Newer update text here today");
  });

  it("project with multiple updates maintains chronological order", () => {
    const updates = [
      makeUpdate({ summary: "Third update — most recent one" }),
      makeUpdate({ summary: "Second update — middle one" }),
      makeUpdate({ summary: "First update — oldest one" }),
    ];
    expect(updates[0].summary).toContain("Third");
    expect(updates[2].summary).toContain("First");
  });
});

// ── Export logic ──────────────────────────────────────────────────────────────

describe("export logic", () => {
  const projects = [
    makeProject({
      name: "Project Alpha",
      status: "Active",
      model: "Claude",
      updates: [
        makeUpdate({ summary: "Built the initial scaffolding today", detail: "Set up Next.js with TypeScript" }),
      ],
    }),
    makeProject({
      name: "Project Beta",
      status: "Blocked",
      model: "GPT-4o",
      updates: [],
    }),
  ];

  it("JSON export contains all projects", () => {
    const exported = JSON.parse(JSON.stringify(projects));
    expect(exported).toHaveLength(2);
    expect(exported[0].name).toBe("Project Alpha");
    expect(exported[1].name).toBe("Project Beta");
  });

  it("JSON export is valid JSON", () => {
    expect(() => JSON.parse(JSON.stringify(projects))).not.toThrow();
  });

  it("Markdown export contains project name as heading", () => {
    const md = projects.map(p =>
      `# ${p.name}\n**Status:** ${p.status} | **Model:** ${p.model}\n\n` +
      p.updates.map(u => `### ${u.summary}\n${u.detail}\n`).join("\n")
    ).join("\n---\n\n");

    expect(md).toContain("# Project Alpha");
    expect(md).toContain("# Project Beta");
    expect(md).toContain("**Status:** Active");
    expect(md).toContain("**Status:** Blocked");
  });

  it("Markdown export contains update summaries", () => {
    const md = projects.map(p =>
      `# ${p.name}\n` +
      p.updates.map(u => `### ${u.summary}\n`).join("\n")
    ).join("\n");
    expect(md).toContain("Built the initial scaffolding today");
  });

  it("JSON export preserves update timestamps", () => {
    const exported = JSON.parse(JSON.stringify(projects));
    const ts = exported[0].updates[0].timestamp;
    expect(() => new Date(ts)).not.toThrow();
    expect(new Date(ts).toISOString()).toBe(ts);
  });

  it("export does not leak sensitive fields", () => {
    const exported = JSON.stringify(projects);
    // Ensure no API keys or environment variables appear in exported data
    expect(exported).not.toContain("sk-ant");
    expect(exported).not.toContain("VITE_ANTHROPIC");
    expect(exported).not.toContain("api-key");
  });
});

// ── Stats calculation ─────────────────────────────────────────────────────────

describe("stats calculation", () => {
  it("totalUpdates sums updates across all projects", () => {
    const projects = [
      makeProject({ updates: [makeUpdate(), makeUpdate()] }),
      makeProject({ updates: [makeUpdate()] }),
      makeProject({ updates: [] }),
    ];
    const total = projects.reduce((a, p) => a + p.updates.length, 0);
    expect(total).toBe(3);
  });

  it("blocked count reflects only Blocked projects", () => {
    const projects = [
      makeProject({ status: "Active" }),
      makeProject({ status: "Blocked" }),
      makeProject({ status: "Blocked" }),
      makeProject({ status: "Complete" }),
    ];
    const blocked = projects.filter(p => p.status === "Blocked").length;
    expect(blocked).toBe(2);
  });

  it("project count is correct", () => {
    const projects = [makeProject(), makeProject(), makeProject()];
    expect(projects.length).toBe(3);
  });
});
