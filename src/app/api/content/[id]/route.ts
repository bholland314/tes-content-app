import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const content = await db.content.findUnique({
    where: { id: params.id },
    include: { variants: { orderBy: { createdAt: "asc" } } },
  });

  if (!content) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json(content);
}
