import { describe, it, expect } from "vitest";
import { buildVariantPrompt } from "@/lib/claude";

describe("buildVariantPrompt", () => {
  it("includes the original content body", () => {
    const prompt = buildVariantPrompt("We just launched v2!");
    expect(prompt).toContain("We just launched v2!");
  });

  it("requests all 5 platform keys", () => {
    const prompt = buildVariantPrompt("test content");
    expect(prompt).toContain("TWITTER");
    expect(prompt).toContain("LINKEDIN");
    expect(prompt).toContain("INSTAGRAM");
    expect(prompt).toContain("TIKTOK");
    expect(prompt).toContain("FACEBOOK");
  });

  it("instructs Claude to return JSON only", () => {
    const prompt = buildVariantPrompt("test content");
    expect(prompt.toLowerCase()).toContain("json");
    expect(prompt).toContain("no markdown");
  });

  it("includes character limit guidance for Twitter", () => {
    const prompt = buildVariantPrompt("test content");
    expect(prompt).toContain("280");
  });
});
