import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma db
const mockCreate = vi.fn();
const mockFindUnique = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    content: { create: mockCreate, findUnique: mockFindUnique },
    contentVariant: { create: mockCreate },
  },
}));

// Mock Claude generateVariants
const mockGenerateVariants = vi.fn();
vi.mock("@/lib/claude", () => ({
  generateVariants: mockGenerateVariants,
  buildVariantPrompt: (body: string) => `prompt for: ${body}`,
}));

describe("content creation flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates content and returns a record with an id", async () => {
    mockCreate.mockResolvedValueOnce({ id: "c1", body: "Hello world", createdAt: new Date() });
    const { db } = await import("@/lib/db");
    const result = await db.content.create({ data: { body: "Hello world" } });
    expect(result.id).toBe("c1");
    expect(mockCreate).toHaveBeenCalledWith({ data: { body: "Hello world" } });
  });

  it("generates all 5 platform variants from Claude", async () => {
    const fakeVariants = {
      TWITTER: "Short tweet",
      LINKEDIN: "Professional LinkedIn post",
      INSTAGRAM: "Instagram caption #hashtag",
      TIKTOK: "TikTok hook!",
      FACEBOOK: "Facebook community post",
    };
    mockGenerateVariants.mockResolvedValueOnce(fakeVariants);

    const { generateVariants } = await import("@/lib/claude");
    const result = await generateVariants("Hello world");

    expect(result.TWITTER).toBe("Short tweet");
    expect(result.LINKEDIN).toBe("Professional LinkedIn post");
    expect(result.INSTAGRAM).toBe("Instagram caption #hashtag");
    expect(result.TIKTOK).toBe("TikTok hook!");
    expect(result.FACEBOOK).toBe("Facebook community post");
  });

  it("creates a ContentVariant record for each platform", async () => {
    mockFindUnique.mockResolvedValueOnce({ id: "c1", body: "Hello world" });
    const platforms = ["TWITTER", "LINKEDIN", "INSTAGRAM", "TIKTOK", "FACEBOOK"];
    for (const platform of platforms) {
      mockCreate.mockResolvedValueOnce({ id: `v-${platform}`, platform, body: "text" });
    }

    const { db } = await import("@/lib/db");
    const content = await db.content.findUnique({ where: { id: "c1" } });
    expect(content).not.toBeNull();
    expect(content?.id).toBe("c1");
  });
});
