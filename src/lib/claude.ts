import Anthropic from "@anthropic-ai/sdk";

export type PlatformVariants = {
  TWITTER: string;
  LINKEDIN: string;
  INSTAGRAM: string;
  TIKTOK: string;
  FACEBOOK: string;
};

export function buildVariantPrompt(body: string): string {
  return `You are a social media content expert. Adapt the following original content for 5 platforms.

Original content:
${body}

Return ONLY a JSON object with exactly this structure — no markdown fences, no explanation, just the JSON:
{
  "TWITTER": "max 280 chars, punchy, 1-2 hashtags optional",
  "LINKEDIN": "professional tone, 150-300 words, end with a call-to-action",
  "INSTAGRAM": "visual-first, casual, 5-10 relevant hashtags at the end",
  "TIKTOK": "hook in first sentence, short, trendy, informal",
  "FACEBOOK": "conversational, community-focused, 100-200 words"
}`;
}

export async function generateVariants(body: string): Promise<PlatformVariants> {
  const client = new Anthropic();
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: buildVariantPrompt(body) }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "{}";
  const parsed = JSON.parse(text) as PlatformVariants;

  const required = ["TWITTER", "LINKEDIN", "INSTAGRAM", "TIKTOK", "FACEBOOK"] as const;
  for (const key of required) {
    if (typeof parsed[key] !== "string") {
      throw new Error(`Missing platform in Claude response: ${key}`);
    }
  }

  return parsed;
}
