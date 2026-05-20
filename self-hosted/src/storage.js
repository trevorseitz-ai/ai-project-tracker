import { VALID_STATUSES } from "../shared/projectLogic.js";
import { isValidProject, isValidUpdate, normalizeImportedProjects } from "../shared/projectsSchema.js";

export { isValidProject, isValidUpdate, normalizeImportedProjects, VALID_STATUSES };

export const STORAGE_KEY = "ai-project-tracker:projects";
export const AGENT_KEY_STORAGE = "ai-project-tracker:agent-key";

export const DEFAULT_PROJECTS = [
  { id: "seed-alpha", name: "Project Alpha", status: "Active", model: "Claude", updates: [] },
];

const DEFAULT_TRACKER_URL = "http://localhost:3000/api/project-update";

export function getTrackerUrl() {
  const fromEnv = import.meta.env.VITE_TRACKER_URL?.trim();
  return fromEnv || DEFAULT_TRACKER_URL;
}

export function getAgentKey() {
  const fromEnv = import.meta.env.VITE_AGENT_KEY?.trim();
  if (fromEnv) return fromEnv;
  return "dev-agent-key";
}

export function loadProjects() {
  if (typeof localStorage === "undefined") return [...DEFAULT_PROJECTS];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_PROJECTS];
    return normalizeImportedProjects(JSON.parse(raw));
  } catch {
    return [...DEFAULT_PROJECTS];
  }
}

export function saveProjects(projects) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function applyHandshakeConfig(handshakeFile = {}) {
  return {
    ...handshakeFile,
    tracker_url: getTrackerUrl(),
    agent_key: getAgentKey(),
    prepped_at: handshakeFile.prepped_at || new Date().toISOString(),
  };
}

export function injectTrackerIntoScript(script) {
  if (typeof script !== "string") return script;
  const trackerUrl = getTrackerUrl();
  return script
    .replace(/https:\/\/your-tracker\.example\.com\/api\/update/g, trackerUrl)
    .replace(/TRACKER_URL\s*=\s*["'][^"']*["']/g, `TRACKER_URL = "${trackerUrl}"`);
}
