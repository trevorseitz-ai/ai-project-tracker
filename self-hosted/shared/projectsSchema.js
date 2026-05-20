import { VALID_STATUSES } from "./projectLogic.js";

export function isValidUpdate(update) {
  return (
    update &&
    typeof update === "object" &&
    typeof update.id === "string" &&
    typeof update.timestamp === "string" &&
    typeof update.type === "string" &&
    typeof update.summary === "string"
  );
}

export function isValidProject(project) {
  return (
    project &&
    typeof project === "object" &&
    typeof project.id === "string" &&
    typeof project.name === "string" &&
    project.name.trim().length > 0 &&
    VALID_STATUSES.includes(project.status) &&
    typeof project.model === "string" &&
    Array.isArray(project.updates) &&
    project.updates.every(isValidUpdate)
  );
}

export function normalizeImportedProjects(data) {
  const list = Array.isArray(data) ? data : data?.projects;
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("Import file must contain a non-empty projects array.");
  }
  if (!list.every(isValidProject)) {
    throw new Error("Import file has invalid project or update structure.");
  }
  return list;
}
