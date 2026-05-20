import { describe, it, expect, vi } from "vitest";
import { getAnthropicModel, parseJsonFromModel } from "../../src/anthropic.js";

describe("anthropic", () => {
  it("getAnthropicModel defaults to claude-sonnet-4-6", () => {
    vi.stubEnv("VITE_ANTHROPIC_MODEL", "");
    expect(getAnthropicModel()).toBe("claude-sonnet-4-6");
  });

  it("getAnthropicModel uses VITE_ANTHROPIC_MODEL when set", () => {
    vi.stubEnv("VITE_ANTHROPIC_MODEL", "claude-haiku-4-5");
    expect(getAnthropicModel()).toBe("claude-haiku-4-5");
  });

  it("parseJsonFromModel extracts JSON from fenced or noisy output", () => {
    const parsed = parseJsonFromModel("Here you go:\n```json\n{\"ok\":true}\n```");
    expect(parsed.ok).toBe(true);
  });
});
