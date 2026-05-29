import { describe, expect, it } from "vitest";
import { getPrepErrorGuidance, getPrepWarningGuidance } from "../../src/prepErrors.js";

describe("prepErrors", () => {
  it("guides missing API key errors", () => {
    const g = getPrepErrorGuidance("Missing VITE_ANTHROPIC_API_KEY in .env — restart npm run dev after editing.");
    expect(g.title).toMatch(/missing/i);
    expect(g.steps.some(s => s.includes(".env"))).toBe(true);
  });

  it("guides JSON parse errors", () => {
    const g = getPrepErrorGuidance('Unterminated string in JSON at position 22871 (line 148 column 16117)');
    expect(g.title).toMatch(/audit could not be read/i);
    expect(g.steps.some(s => s.includes("RUN PREP AGENT"))).toBe(true);
    expect(g.steps.some(s => s.includes("does not read"))).toBe(true);
  });

  it("guides model not found errors", () => {
    const g = getPrepErrorGuidance("model: claude-old-model (404)");
    expect(g.title).toMatch(/model/i);
    expect(g.steps.some(s => s.includes("VITE_ANTHROPIC_MODEL"))).toBe(true);
  });

  it("guides cut-off warnings", () => {
    const g = getPrepWarningGuidance("The AI response was cut off. Copy the config below.");
    expect(g.title).toMatch(/cut off/i);
    expect(g.steps.length).toBeGreaterThan(0);
  });
});
