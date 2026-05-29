export const PROJECT_PROFILES_KEY = "ai-project-tracker:project-profiles";

export const EMPTY_PROFILE = {
  description: "",
  stack: "",
  blockers: "",
  knownIssues: "",
  agentMode: "autonomous",
  stage: "new",
  agentType: "autonomous",
  existingContext: "",
};

export function loadProjectProfiles() {
  if (typeof localStorage === "undefined") return {};

  try {
    const raw = localStorage.getItem(PROJECT_PROFILES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveProjectProfiles(profiles) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(PROJECT_PROFILES_KEY, JSON.stringify(profiles));
}

export function profileKey(name) {
  return name.trim().toLowerCase();
}

export function getStoredProfile(profiles, name) {
  if (!name?.trim()) return null;
  return profiles[profileKey(name)] || null;
}

export function upsertStoredProfile(profiles, name, patch) {
  const trimmed = name?.trim();
  if (!trimmed) return profiles;

  const key = profileKey(trimmed);
  return {
    ...profiles,
    [key]: {
      projectName: trimmed,
      ...EMPTY_PROFILE,
      ...profiles[key],
      ...patch,
      projectName: trimmed,
    },
  };
}

export function profileFromBoardProject(project, stored = null) {
  const last = project.updates?.[0];
  const blockersFromUpdate = Array.isArray(last?.blockers) ? last.blockers.join(", ") : "";

  return {
    projectName: project.name,
    description: stored?.description || last?.detail || "",
    stack: stored?.stack || "",
    model:
      stored?.model ||
      (project.model && project.model !== "Unknown" ? project.model : "") ||
      last?.model_used ||
      "",
    status: stored?.status || project.status || "Active",
    blockers: stored?.blockers || blockersFromUpdate,
    knownIssues: stored?.knownIssues || "",
    agentMode: stored?.agentMode || "autonomous",
    stage: stored?.stage || (project.updates?.length ? "existing" : "new"),
    agentType: stored?.agentType || "autonomous",
    existingContext: stored?.existingContext || last?.summary || "",
  };
}

export function toPrepForm(profile) {
  return {
    projectName: profile.projectName || "",
    description: profile.description || "",
    stack: profile.stack || "",
    model: profile.model || "",
    status: profile.status || "Active",
    blockers: profile.blockers || "",
    knownIssues: profile.knownIssues || "",
    agentMode: profile.agentMode || "autonomous",
  };
}

export function toPushForm(profile) {
  return {
    projectName: profile.projectName || "",
    description: profile.description || "",
    stack: profile.stack || "",
    model: profile.model || "",
    stage: profile.stage || "new",
    existingContext: profile.existingContext || "",
    agentType: profile.agentType || "autonomous",
  };
}

export function mergePrepAndPush(prepForm, pushForm) {
  return {
    projectName: prepForm.projectName || pushForm.projectName,
    description: prepForm.description || pushForm.description,
    stack: prepForm.stack || pushForm.stack,
    model: prepForm.model || pushForm.model,
    status: prepForm.status,
    blockers: prepForm.blockers,
    knownIssues: prepForm.knownIssues,
    agentMode: prepForm.agentMode,
    stage: pushForm.stage,
    agentType: pushForm.agentType,
    existingContext: pushForm.existingContext,
  };
}
