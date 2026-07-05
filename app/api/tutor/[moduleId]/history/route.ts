import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { tutorMessages } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { moduleId } = await params;
  const mid = parseInt(moduleId, 10);
  if (isNaN(mid) || mid < 1 || mid > 5) {
    return NextResponse.json({ error: "Invalid moduleId" }, { status: 400 });
  }

  const messages = await db
    .select()
    .from(tutorMessages)
    .where(and(eq(tutorMessages.userId, userId), eq(tutorMessages.moduleId, mid)))
    .orderBy(asc(tutorMessages.createdAt))
    .limit(50);

  return NextResponse.json({ messages });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { moduleId } = await params;
  const mid = parseInt(moduleId, 10);
  if (isNaN(mid)) {
    return NextResponse.json({ error: "Invalid moduleId" }, { status: 400 });
  }

  await db
    .delete(tutorMessages)
    .where(and(eq(tutorMessages.userId, userId), eq(tutorMessages.moduleId, mid)));

  return NextResponse.json({ ok: true });
}
