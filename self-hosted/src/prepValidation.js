export const PREP_FIELD_LIMITS = {
  projectName: { max: 120, label: "Project Name" },
  description: { max: 2000, label: "What it does" },
  stack: { max: 500, label: "Stack / Tools" },
  model: { max: 100, label: "AI Model" },
  blockers: { max: 500, label: "Known Blockers" },
  knownIssues: { max: 1500, label: "Known Gaps / Issues" },
};

/** Combined limit for free-text fields sent to the AI (helps avoid truncated responses). */
export const PREP_TOTAL_TEXT_LIMIT = 4500;

export function mapAgentModeToReporterMode(agentMode) {
  if (agentMode === "human") return "pull";
  if (agentMode === "autonomous") return "push";
  return "either";
}

export function buildHandshakeFromPrepForm(prepForm) {
  const knownIssuesRaw = String(prepForm.knownIssues || "").trim();
  const blockersRaw = String(prepForm.blockers || "").trim();

  return {
    project_name: String(prepForm.projectName || "").trim(),
    description: String(prepForm.description || "").trim(),
    model_used: String(prepForm.model || "").trim() || null,
    stack: String(prepForm.stack || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean),
    status: prepForm.status || "Active",
    blockers: blockersRaw ? [blockersRaw] : [],
    known_issues: knownIssuesRaw
      ? knownIssuesRaw.split("\n").map(s => s.trim()).filter(Boolean)
      : [],
    next_steps: ["Deploy reporter agent"],
    reporter_mode: mapAgentModeToReporterMode(prepForm.agentMode),
    prep_version: "1.0",
  };
}

export function validatePrepForm(prepForm) {
  const fieldErrors = {};
  const messages = [];

  if (!String(prepForm.projectName || "").trim()) {
    fieldErrors.projectName = "Project Name is required.";
    messages.push(fieldErrors.projectName);
  }

  for (const [key, { max, label }] of Object.entries(PREP_FIELD_LIMITS)) {
    const value = String(prepForm[key] || "");
    if (value.length > max) {
      fieldErrors[key] =
        `${label} is too long (${value.length} characters). Maximum is ${max}. Shorten it before running Prep.`;
      messages.push(fieldErrors[key]);
    }
  }

  const textKeys = ["description", "stack", "model", "blockers", "knownIssues"];
  const totalText = textKeys.reduce((sum, key) => sum + String(prepForm[key] || "").length, 0);
  if (totalText > PREP_TOTAL_TEXT_LIMIT) {
    fieldErrors._form =
      `Combined text is too long (${totalText} characters). Maximum is ${PREP_TOTAL_TEXT_LIMIT}. Shorten Description, Blockers, or Known Gaps before running Prep.`;
    messages.push(fieldErrors._form);
  }

  return { ok: messages.length === 0, fieldErrors, messages };
}

export function getPrepFieldLimit(key) {
  return PREP_FIELD_LIMITS[key]?.max ?? null;
}
