export const VALID_TYPES = ["feature", "tool", "daily", "blocker", "progress"];
export const VALID_STATUSES = ["Active", "Blocked", "Stalled", "Complete"];

export const TS = () => new Date().toISOString();
export const uid = () => Math.random().toString(36).slice(2, 9);

export function commitUpdateToProjects(projects, update, model) {
  const name = update.project || "Unknown";
  const found = projects.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (!found) {
    return [
      ...projects,
      {
        id: uid(),
        name,
        status: update.status || "Active",
        model: model || update.model_used || "Unknown",
        updates: [update],
      },
    ];
  }
  return projects.map(p =>
    p.name.toLowerCase() === name.toLowerCase()
      ? {
          ...p,
          status: update.status || p.status,
          model: model || update.model_used || p.model,
          updates: [update, ...p.updates],
        }
      : p
  );
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
