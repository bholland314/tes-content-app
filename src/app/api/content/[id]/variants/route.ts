import { db } from "@/lib/db";
import { generateVariants } from "@/lib/claude";
import { NextRequest, NextResponse } from "next/server";

const PLATFORMS = ["TWITTER", "LINKEDIN", "INSTAGRAM", "TIKTOK", "FACEBOOK"] as const;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const content = await db.content.findUnique({ where: { id: params.id } });
  if (!content) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const variantTexts = await generateVariants(content.body);

  const variants = await Promise.all(
    PLATFORMS.map((platform) =>
      db.contentVariant.create({
        data: { contentId: content.id, platform, body: variantTexts[platform] },
      }),
    ),
  );

  return NextResponse.json(variants, { status: 201 });
}
