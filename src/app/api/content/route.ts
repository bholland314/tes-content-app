import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const body = json?.body;

  if (!body || typeof body !== "string" || body.trim().length === 0) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }

  const content = await db.content.create({
    data: { body: body.trim() },
  });

  return NextResponse.json(content, { status: 201 });
}
