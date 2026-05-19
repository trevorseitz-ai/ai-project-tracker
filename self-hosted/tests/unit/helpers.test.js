/**
 * unit/helpers.test.js
 *
 * Tests for all pure helper functions and constants extracted from App.jsx.
 * These tests run instantly with no API calls or browser rendering.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Re-implement helpers here so they can be tested in isolation.
// When the app is refactored into separate modules, import directly instead.

const TS = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 9);

const UPDATE_TYPES = {
  feature: { label: "Feature Idea", color: "#6EE7B7", icon: "✦" },
  tool: { label: "New Tool", color: "#93C5FD", icon: "⚙" },
  daily: { label: "Daily Log", color: "#FDE68A", icon: "◉" },
  blocker: { label: "Blocker", color: "#FCA5A5", icon: "⚠" },
  progress: { label: "Progress", color: "#C4B5FD", icon: "▲" },
};

const STATUS_COLORS = {
  Active: "#6EE7B7",
  Blocked: "#FCA5A5",
  Stalled: "#FDE68A",
  Complete: "#93C5FD",
};

function detectMissing(update) {
  const issues = [];
  if (!update.project || update.project === "Unknown") issues.push("Project name is missing or unclear.");
  if (!update.summary || update.summary.length < 10) issues.push("Summary seems too brief.");
  if (update.confidence < 0.6) issues.push("Low confidence parse — please review all fields.");
  if (update.missing_fields?.length) issues.push(...update.missing_fields.map(f => `Field uncertain: "${f}"`));
  return issues;
}

// Simulate commitToBoard logic
function commitToBoard(projects, update, model) {
  const name = update.project || "Unknown";
  const found = projects.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (!found) {
    return [...projects, {
      id: uid(),
      name,
      status: update.status || "Active",
      model: model || update.model_used || "Unknown",
      updates: [update],
    }];
  }
  return projects.map(p =>
    p.name.toLowerCase() === name.toLowerCase()
      ? { ...p, status: update.status || p.status, updates: [update, ...p.updates] }
      : p
  );
}

// ── TS() ─────────────────────────────────────────────────────────────────────

describe("TS()", () => {
  it("returns a valid ISO 8601 timestamp", () => {
    const ts = TS();
    expect(() => new Date(ts)).not.toThrow();
    expect(new Date(ts).toISOString()).toBe(ts);
  });

  it("returns a timestamp close to now", () => {
    const before = Date.now();
    const ts = TS();
    const after = Date.now();
    const parsed = new Date(ts).getTime();
    expect(parsed).toBeGreaterThanOrEqual(before);
    expect(parsed).toBeLessThanOrEqual(after);
  });
});

// ── uid() ─────────────────────────────────────────────────────────────────────

describe("uid()", () => {
  it("returns a non-empty string", () => {
    expect(typeof uid()).toBe("string");
    expect(uid().length).toBeGreaterThan(0);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 1000 }, uid));
    expect(ids.size).toBe(1000);
  });

  it("contains only alphanumeric characters", () => {
    for (let i = 0; i < 50; i++) {
      expect(uid()).toMatch(/^[a-z0-9]+$/);
    }
  });
});

// ── UPDATE_TYPES ──────────────────────────────────────────────────────────────

describe("UPDATE_TYPES", () => {
  const validTypes = ["feature", "tool", "daily", "blocker", "progress"];

  it("contains all required update type keys", () => {
    validTypes.forEach(type => {
      expect(UPDATE_TYPES).toHaveProperty(type);
    });
  });

  it("each type has label, color, and icon", () => {
    validTypes.forEach(type => {
      expect(UPDATE_TYPES[type]).toHaveProperty("label");
      expect(UPDATE_TYPES[type]).toHaveProperty("color");
      expect(UPDATE_TYPES[type]).toHaveProperty("icon");
    });
  });

  it("all colors are valid hex codes", () => {
    validTypes.forEach(type => {
      expect(UPDATE_TYPES[type].color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it("all labels are non-empty strings", () => {
    validTypes.forEach(type => {
      expect(typeof UPDATE_TYPES[type].label).toBe("string");
      expect(UPDATE_TYPES[type].label.length).toBeGreaterThan(0);
    });
  });
});

// ── STATUS_COLORS ─────────────────────────────────────────────────────────────

describe("STATUS_COLORS", () => {
  const validStatuses = ["Active", "Blocked", "Stalled", "Complete"];

  it("contains all required status keys", () => {
    validStatuses.forEach(status => {
      expect(STATUS_COLORS).toHaveProperty(status);
    });
  });

  it("all status colors are valid hex codes", () => {
    validStatuses.forEach(status => {
      expect(STATUS_COLORS[status]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it("Blocked status has a red-ish color to signal danger", () => {
    // Blocked should use the FCA5A5 red, not green
    expect(STATUS_COLORS.Blocked).not.toBe(STATUS_COLORS.Active);
    expect(STATUS_COLORS.Blocked).toBe("#FCA5A5");
  });
});

// ── detectMissing() ───────────────────────────────────────────────────────────

describe("detectMissing()", () => {
  it("returns no issues for a complete, high-confidence update", () => {
    const update = {
      project: "My Project",
      summary: "Completed the authentication module today",
      confidence: 0.9,
      missing_fields: [],
    };
    expect(detectMissing(update)).toHaveLength(0);
  });

  it("flags missing project name", () => {
    const update = { project: "", summary: "Did some work", confidence: 0.8, missing_fields: [] };
    const issues = detectMissing(update);
    expect(issues.some(i => i.includes("Project name"))).toBe(true);
  });

  it("flags 'Unknown' as a missing project name", () => {
    const update = { project: "Unknown", summary: "Did some work today on the project", confidence: 0.8, missing_fields: [] };
    const issues = detectMissing(update);
    expect(issues.some(i => i.includes("Project name"))).toBe(true);
  });

  it("flags a summary that is too short (under 10 chars)", () => {
    const update = { project: "My Project", summary: "Done", confidence: 0.8, missing_fields: [] };
    const issues = detectMissing(update);
    expect(issues.some(i => i.includes("Summary"))).toBe(true);
  });

  it("does not flag a summary of exactly 10 characters", () => {
    const update = { project: "My Project", summary: "1234567890", confidence: 0.8, missing_fields: [] };
    const issues = detectMissing(update);
    expect(issues.some(i => i.includes("Summary"))).toBe(false);
  });

  it("flags low confidence (below 0.6)", () => {
    const update = { project: "My Project", summary: "Completed work today", confidence: 0.4, missing_fields: [] };
    const issues = detectMissing(update);
    expect(issues.some(i => i.includes("confidence"))).toBe(true);
  });

  it("does not flag confidence of exactly 0.6", () => {
    const update = { project: "My Project", summary: "Completed work today", confidence: 0.6, missing_fields: [] };
    const issues = detectMissing(update);
    expect(issues.some(i => i.includes("confidence"))).toBe(false);
  });

  it("surfaces each missing_field as a separate issue", () => {
    const update = {
      project: "My Project",
      summary: "Completed work today",
      confidence: 0.8,
      missing_fields: ["model_used", "stack"],
    };
    const issues = detectMissing(update);
    expect(issues.some(i => i.includes('"model_used"'))).toBe(true);
    expect(issues.some(i => i.includes('"stack"'))).toBe(true);
  });

  it("can return multiple issues at once", () => {
    const update = { project: "Unknown", summary: "Hi", confidence: 0.2, missing_fields: ["model_used"] };
    const issues = detectMissing(update);
    expect(issues.length).toBeGreaterThanOrEqual(3);
  });
});

// ── commitToBoard() ───────────────────────────────────────────────────────────

describe("commitToBoard()", () => {
  const makeUpdate = (overrides = {}) => ({
    id: uid(),
    timestamp: TS(),
    type: "daily",
    project: "Test Project",
    summary: "Test update summary text",
    detail: "Test detail",
    model_used: "Claude",
    status: "Active",
    blockers: [],
    next_steps: [],
    confidence: 0.9,
    missing_fields: [],
    ...overrides,
  });

  it("creates a new project if none exists", () => {
    const result = commitToBoard([], makeUpdate(), "Claude");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Test Project");
  });

  it("adds the update to an existing project", () => {
    const existing = [{
      id: uid(), name: "Test Project", status: "Active", model: "Claude", updates: [],
    }];
    const result = commitToBoard(existing, makeUpdate(), "Claude");
    expect(result[0].updates).toHaveLength(1);
  });

  it("prepends new updates (most recent first)", () => {
    const firstUpdate = makeUpdate({ summary: "First update happened here" });
    const board1 = commitToBoard([], firstUpdate, "Claude");
    const secondUpdate = makeUpdate({ summary: "Second update happened later" });
    const board2 = commitToBoard(board1, secondUpdate, "Claude");
    expect(board2[0].updates[0].summary).toBe("Second update happened later");
    expect(board2[0].updates[1].summary).toBe("First update happened here");
  });

  it("matching is case-insensitive", () => {
    const existing = [{ id: uid(), name: "test project", status: "Active", model: "Claude", updates: [] }];
    const result = commitToBoard(existing, makeUpdate({ project: "TEST PROJECT" }), "Claude");
    expect(result).toHaveLength(1);
    expect(result[0].updates).toHaveLength(1);
  });

  it("updates project status when update has a new status", () => {
    const existing = [{ id: uid(), name: "Test Project", status: "Active", model: "Claude", updates: [] }];
    const result = commitToBoard(existing, makeUpdate({ status: "Blocked" }), "Claude");
    expect(result[0].status).toBe("Blocked");
  });

  it("does not affect other projects", () => {
    const existing = [
      { id: uid(), name: "Project A", status: "Active", model: "Claude", updates: [] },
      { id: uid(), name: "Project B", status: "Active", model: "GPT-4o", updates: [] },
    ];
    const result = commitToBoard(existing, makeUpdate({ project: "Project A" }), "Claude");
    expect(result[1].updates).toHaveLength(0);
  });

  it("uses 'Unknown' as fallback project name when project field is empty", () => {
    const result = commitToBoard([], makeUpdate({ project: "" }), "Claude");
    expect(result[0].name).toBe("Unknown");
  });

  it("falls back to update.model_used if no model argument provided", () => {
    const result = commitToBoard([], makeUpdate({ model_used: "Gemini" }), null);
    expect(result[0].model).toBe("Gemini");
  });

  it("preserves existing updates when adding a new one", () => {
    const update1 = makeUpdate({ summary: "First update for this project" });
    const board1 = commitToBoard([], update1, "Claude");
    const update2 = makeUpdate({ summary: "Second update for this project" });
    const board2 = commitToBoard(board1, update2, "Claude");
    expect(board2[0].updates).toHaveLength(2);
  });
});

// ── Update schema validation ──────────────────────────────────────────────────

describe("Update schema validation", () => {
  const VALID_TYPES = ["feature", "tool", "daily", "blocker", "progress"];
  const VALID_STATUSES = ["Active", "Blocked", "Stalled", "Complete"];

  function isValidUpdate(u) {
    return (
      VALID_TYPES.includes(u.type) &&
      typeof u.project === "string" &&
      typeof u.summary === "string" &&
      typeof u.detail === "string" &&
      VALID_STATUSES.includes(u.status) &&
      Array.isArray(u.blockers) &&
      Array.isArray(u.next_steps) &&
      typeof u.confidence === "number" &&
      u.confidence >= 0 &&
      u.confidence <= 1 &&
      Array.isArray(u.missing_fields)
    );
  }

  it("accepts a fully valid update object", () => {
    const update = {
      type: "feature",
      project: "My Project",
      summary: "Added new search feature",
      detail: "Implemented full text search using Elasticsearch",
      model_used: "Claude",
      status: "Active",
      blockers: [],
      next_steps: ["Deploy to staging"],
      confidence: 0.9,
      missing_fields: [],
    };
    expect(isValidUpdate(update)).toBe(true);
  });

  it("rejects unknown type values", () => {
    const update = {
      type: "unknown_type",
      project: "My Project",
      summary: "Did some work today",
      detail: "Details here",
      status: "Active",
      blockers: [],
      next_steps: [],
      confidence: 0.9,
      missing_fields: [],
    };
    expect(isValidUpdate(update)).toBe(false);
  });

  it("rejects unknown status values", () => {
    const update = {
      type: "daily",
      project: "My Project",
      summary: "Did some work today",
      detail: "Details here",
      status: "InProgress",
      blockers: [],
      next_steps: [],
      confidence: 0.9,
      missing_fields: [],
    };
    expect(isValidUpdate(update)).toBe(false);
  });

  it("rejects confidence outside 0-1 range", () => {
    const update = {
      type: "daily",
      project: "My Project",
      summary: "Did some work today",
      detail: "Details here",
      status: "Active",
      blockers: [],
      next_steps: [],
      confidence: 1.5,
      missing_fields: [],
    };
    expect(isValidUpdate(update)).toBe(false);
  });

  it("accepts confidence of exactly 0 and exactly 1", () => {
    const base = {
      type: "daily", project: "P", summary: "Summary text here",
      detail: "D", status: "Active", blockers: [], next_steps: [], missing_fields: [],
    };
    expect(isValidUpdate({ ...base, confidence: 0 })).toBe(true);
    expect(isValidUpdate({ ...base, confidence: 1 })).toBe(true);
  });
});
