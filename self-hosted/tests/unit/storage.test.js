import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  STORAGE_KEY,
  DEFAULT_PROJECTS,
  getTrackerUrl,
  getAgentKey,
  isValidProject,
  normalizeImportedProjects,
  loadProjects,
  saveProjects,
  applyHandshakeConfig,
  injectTrackerIntoScript,
} from "../../src/storage.js";

function makeProject(overrides = {}) {
  return {
    id: "proj1",
    name: "Test Project",
    status: "Active",
    model: "Claude",
    updates: [
      {
        id: "upd1",
        timestamp: new Date().toISOString(),
        type: "daily",
        summary: "Did some work today",
      },
    ],
    ...overrides,
  };
}

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllEnvs();
  });

  it("getTrackerUrl uses env or default", () => {
    expect(getTrackerUrl()).toBe("http://localhost:3000/api/project-update");
    vi.stubEnv("VITE_TRACKER_URL", "https://tracker.example.com/api/project-update");
    expect(getTrackerUrl()).toBe("https://tracker.example.com/api/project-update");
  });

  it("getAgentKey prefers VITE_AGENT_KEY", () => {
    vi.stubEnv("VITE_AGENT_KEY", "key-from-env");
    expect(getAgentKey()).toBe("key-from-env");
  });

  it("getAgentKey falls back to dev default", () => {
    vi.stubEnv("VITE_AGENT_KEY", "");
    expect(getAgentKey()).toBe("dev-agent-key");
  });

  it("isValidProject rejects malformed projects", () => {
    expect(isValidProject(makeProject())).toBe(true);
    expect(isValidProject(makeProject({ status: "Hacked" }))).toBe(false);
    expect(isValidProject(makeProject({ updates: [{ id: "x" }] }))).toBe(false);
  });

  it("normalizeImportedProjects accepts array or { projects } wrapper", () => {
    const projects = [makeProject()];
    expect(normalizeImportedProjects(projects)).toEqual(projects);
    expect(normalizeImportedProjects({ projects })).toEqual(projects);
    expect(() => normalizeImportedProjects({})).toThrow(/non-empty projects array/);
  });

  it("loadProjects returns defaults when storage is empty", () => {
    expect(loadProjects()).toEqual(DEFAULT_PROJECTS);
  });

  it("saveProjects and loadProjects round-trip", () => {
    const projects = [makeProject(), makeProject({ id: "proj2", name: "Other" })];
    saveProjects(projects);
    expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();
    expect(loadProjects()).toEqual(projects);
  });

  it("loadProjects falls back to defaults on corrupt JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadProjects()).toEqual(DEFAULT_PROJECTS);
  });

  it("applyHandshakeConfig injects tracker url and agent key", () => {
    vi.stubEnv("VITE_TRACKER_URL", "https://my-tracker.test/api/project-update");
    vi.stubEnv("VITE_AGENT_KEY", "key-test");
    const result = applyHandshakeConfig({ project_name: "Demo", tracker_url: "old", agent_key: "old" });
    expect(result.tracker_url).toBe("https://my-tracker.test/api/project-update");
    expect(result.agent_key).toBe("key-test");
    expect(result.project_name).toBe("Demo");
    expect(result.prepped_at).toBeTruthy();
  });

  it("injectTrackerIntoScript replaces placeholder tracker URL", () => {
    vi.stubEnv("VITE_TRACKER_URL", "https://my-tracker.test/api/project-update");
    const script = 'TRACKER_URL = "https://your-tracker.example.com/api/update"';
    expect(injectTrackerIntoScript(script)).toContain("https://my-tracker.test/api/project-update");
  });
});
