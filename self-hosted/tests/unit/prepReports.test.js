import { describe, expect, it } from "vitest";
import {
  getStoredPrepReport,
  prepReportSummary,
  upsertPrepReport,
} from "../../src/prepReports.js";

describe("prepReports", () => {
  const sampleResult = {
    audit: { overall_score: 72, categories: [{ name: "Identity", score: 80 }] },
    handshake_file: { project_name: "ReelDive" },
    prep_summary: "Done",
    human_actions_required: [],
    compliance_update: { type: "progress", summary: "Prep done" },
  };

  it("stores and retrieves a report by project name", () => {
    const reports = upsertPrepReport({}, "ReelDive", {
      prepResult: sampleResult,
      prepError: null,
      prepWarning: null,
    });
    const stored = getStoredPrepReport(reports, "reeldive");
    expect(stored?.projectName).toBe("ReelDive");
    expect(stored?.prepResult.audit.overall_score).toBe(72);
  });

  it("summarizes a stored report", () => {
    const reports = upsertPrepReport({}, "ReelDive", { prepResult: sampleResult });
    const summary = prepReportSummary(getStoredPrepReport(reports, "ReelDive"));
    expect(summary?.score).toBe(72);
    expect(summary?.hasAudit).toBe(true);
  });
});
