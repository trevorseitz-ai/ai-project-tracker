export const PREP_REPORTS_KEY = "ai-project-tracker:prep-reports";

export function profileKey(name) {
  return String(name || "").trim().toLowerCase();
}

export function loadPrepReports() {
  if (typeof localStorage === "undefined") return {};

  try {
    const raw = localStorage.getItem(PREP_REPORTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function savePrepReports(reports) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(PREP_REPORTS_KEY, JSON.stringify(reports));
}

export function getStoredPrepReport(reports, projectName) {
  if (!projectName?.trim()) return null;
  return reports[profileKey(projectName)] || null;
}

export function upsertPrepReport(reports, projectName, snapshot) {
  const trimmed = projectName.trim();
  if (!trimmed || !snapshot?.prepResult) return reports;

  return {
    ...reports,
    [profileKey(trimmed)]: {
      projectName: trimmed,
      savedAt: new Date().toISOString(),
      prepResult: snapshot.prepResult,
      prepError: snapshot.prepError || null,
      prepWarning: snapshot.prepWarning || null,
    },
  };
}

export function prepReportSummary(report) {
  if (!report?.prepResult) return null;

  const score = report.prepResult.audit?.overall_score;
  const hasAudit = (report.prepResult.audit?.categories?.length ?? 0) > 0;

  return {
    score: typeof score === "number" ? score : null,
    failed: !!report.prepError,
    hasAudit,
    savedAt: report.savedAt,
  };
}
