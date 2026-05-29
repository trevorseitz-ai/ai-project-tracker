import { describe, expect, it } from "vitest";
import {
  buildHandshakeFromPrepForm,
  validatePrepForm,
  PREP_FIELD_LIMITS,
} from "../../src/prepValidation.js";

describe("prepValidation", () => {
  const baseForm = {
    projectName: "ReelDive",
    description: "A diving app",
    stack: "React, Node",
    model: "Claude",
    status: "Active",
    blockers: "TV app links",
    knownIssues: "Missing README section",
    agentMode: "autonomous",
  };

  it("buildHandshakeFromPrepForm includes all form fields", () => {
    const hs = buildHandshakeFromPrepForm(baseForm);
    expect(hs.project_name).toBe("ReelDive");
    expect(hs.description).toBe("A diving app");
    expect(hs.model_used).toBe("Claude");
    expect(hs.stack).toEqual(["React", "Node"]);
    expect(hs.blockers).toEqual(["TV app links"]);
    expect(hs.known_issues).toEqual(["Missing README section"]);
    expect(hs.reporter_mode).toBe("push");
    expect(hs.prep_version).toBe("1.0");
  });

  it("validatePrepForm rejects missing project name", () => {
    const result = validatePrepForm({ ...baseForm, projectName: "  " });
    expect(result.ok).toBe(false);
    expect(result.fieldErrors.projectName).toBeTruthy();
  });

  it("validatePrepForm rejects fields over max length", () => {
    const result = validatePrepForm({
      ...baseForm,
      description: "x".repeat(PREP_FIELD_LIMITS.description.max + 1),
    });
    expect(result.ok).toBe(false);
    expect(result.fieldErrors.description).toMatch(/too long/i);
  });

  it("validatePrepForm accepts a normal form", () => {
    expect(validatePrepForm(baseForm).ok).toBe(true);
  });
});
