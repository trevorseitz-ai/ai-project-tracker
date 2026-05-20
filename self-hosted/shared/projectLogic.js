export const VALID_TYPES = ["feature", "tool", "daily", "blocker", "progress"];
export const VALID_STATUSES = ["Active", "Blocked", "Stalled", "Complete"];

export const TS = () => new Date().toISOString();
export const uid = () => Math.random().toString(36).slice(2, 9);

export function commitUpdateToProjects(projects, update, model) {
  const normalized = normalizeStoredUpdate(update, update?.project);
  const name = normalized.project || "Unknown";
  const projectStatus = VALID_STATUSES.includes(normalized.status) ? normalized.status : "Active";
  const projectModel =
    (typeof model === "string" && model.trim()) ||
    (typeof normalized.model_used === "string" && normalized.model_used.trim()) ||
    "Unknown";

  const found = projects.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (!found) {
    return [
      ...projects,
      {
        id: uid(),
        name,
        status: projectStatus,
        model: projectModel,
        updates: [normalized],
      },
    ];
  }
  return projects.map(p =>
    p.name.toLowerCase() === name.toLowerCase()
      ? {
          ...p,
          status: projectStatus,
          model: projectModel,
          updates: [normalized, ...p.updates],
        }
      : p
  );
}

export function normalizeStoredUpdate(update, projectName = "Unknown") {
  const name =
    typeof update?.project === "string" && update.project.trim()
      ? update.project.trim()
      : projectName;

  return {
    id: typeof update?.id === "string" ? update.id : uid(),
    timestamp: typeof update?.timestamp === "string" ? update.timestamp : TS(),
    type: typeof update?.type === "string" && update.type.trim() ? update.type : "daily",
    project: name,
    summary:
      typeof update?.summary === "string" && update.summary.trim()
        ? update.summary.trim()
        : "Update",
    detail: typeof update?.detail === "string" ? update.detail : "",
    model_used: update?.model_used ?? null,
    status: VALID_STATUSES.includes(update?.status) ? update.status : "Active",
    blockers: Array.isArray(update?.blockers) ? update.blockers : [],
    next_steps: Array.isArray(update?.next_steps) ? update.next_steps : [],
    confidence: typeof update?.confidence === "number" ? update.confidence : 0.8,
    missing_fields: Array.isArray(update?.missing_fields) ? update.missing_fields : [],
  };
}

export function sanitizeProjectsForServer(projects) {
  if (!Array.isArray(projects)) return [];

  return projects
    .filter(p => p && typeof p.name === "string" && p.name.trim())
    .map(p => ({
      id: typeof p.id === "string" ? p.id : uid(),
      name: p.name.trim(),
      status: VALID_STATUSES.includes(p.status) ? p.status : "Active",
      model: typeof p.model === "string" && p.model.trim() ? p.model : "Unknown",
      updates: Array.isArray(p.updates)
        ? p.updates.map(u => normalizeStoredUpdate(u, p.name))
        : [],
    }));
}

export function validateAgentUpdatePayload(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body." };
  }

  const required = ["type", "project", "summary", "status"];
  for (const field of required) {
    if (!body[field] || typeof body[field] !== "string" || !body[field].trim()) {
      return { ok: false, error: `Missing or invalid field: ${field}` };
    }
  }

  if (!VALID_TYPES.includes(body.type)) {
    return { ok: false, error: "Invalid request body." };
  }

  if (!VALID_STATUSES.includes(body.status)) {
    return { ok: false, error: "Invalid request body." };
  }

  if (body.confidence !== undefined) {
    const confidence = Number(body.confidence);
    if (Number.isNaN(confidence) || confidence < 0 || confidence > 1) {
      return { ok: false, error: "Invalid request body." };
    }
  }

  return { ok: true };
}

export function normalizeAgentUpdate(body) {
  return {
    id: typeof body.id === "string" ? body.id : uid(),
    timestamp: typeof body.timestamp === "string" ? body.timestamp : TS(),
    type: body.type,
    project: body.project.trim(),
    summary: body.summary.trim(),
    detail: typeof body.detail === "string" ? body.detail : "",
    model_used: body.model_used ?? null,
    status: body.status,
    blockers: Array.isArray(body.blockers) ? body.blockers : [],
    next_steps: Array.isArray(body.next_steps) ? body.next_steps : [],
    confidence: body.confidence !== undefined ? Number(body.confidence) : 0.8,
    missing_fields: Array.isArray(body.missing_fields) ? body.missing_fields : [],
  };
}

export function getProjectStatus(projects, projectName) {
  const project = projects.find(p => p.name.toLowerCase() === projectName.toLowerCase());
  if (!project) return null;

  const lastUpdate = project.updates[0];
  return {
    project_name: project.name,
    status: project.status,
    blockers: lastUpdate?.blockers?.length ? lastUpdate.blockers : project.updates.flatMap(u => u.blockers || []).slice(0, 10),
    next_steps: lastUpdate?.next_steps || [],
    last_update: lastUpdate?.timestamp || null,
  };
}
