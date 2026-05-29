import { describe, it, expect, beforeEach } from "vitest";
import {
  profileKey,
  upsertStoredProfile,
  profileFromBoardProject,
  toPrepForm,
  toPushForm,
  mergePrepAndPush,
} from "../../src/projectProfiles.js";

describe("projectProfiles", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("profileKey is case-insensitive", () => {
    expect(profileKey("ReelDive")).toBe(profileKey("reeldive"));
  });

  it("upsertStoredProfile merges by project name", () => {
    const next = upsertStoredProfile({}, "ReelDive", { description: "Video app", stack: "Python" });
    expect(next[profileKey("ReelDive")].description).toBe("Video app");
    expect(next[profileKey("reeldive")].stack).toBe("Python");
  });

  it("profileFromBoardProject uses board data and stored overrides", () => {
    const project = {
      name: "ReelDive",
      status: "Active",
      model: "Claude",
      updates: [{ detail: "Built parser", summary: "Parser works", blockers: ["Need tests"] }],
    };
    const profile = profileFromBoardProject(project, { stack: "Python" });
    expect(profile.projectName).toBe("ReelDive");
    expect(profile.description).toBe("Built parser");
    expect(profile.stack).toBe("Python");
    expect(profile.stage).toBe("existing");
  });

  it("toPrepForm and toPushForm share project fields", () => {
    const merged = mergePrepAndPush(
      { projectName: "X", description: "Desc", stack: "Py", model: "GPT", status: "Active", blockers: "", knownIssues: "", agentMode: "human" },
      { projectName: "X", description: "Desc", stack: "Py", model: "GPT", stage: "existing", existingContext: "WIP", agentType: "autonomous" }
    );
    expect(toPrepForm(merged).description).toBe("Desc");
    expect(toPushForm(merged).stage).toBe("existing");
  });
});
