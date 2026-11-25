import { NextResponse } from "next/server";
import { getUserId as resolveUserId } from "@/lib/auth";
import { DEMO_MODE } from "@/lib/demo";
import { z } from "zod";

const STEP_ORDER = [
  "day1-podcast",
  "day1-whitepaper",
  "day1-codelab-1",
  "day1-codelab-2",
  "day2-podcast",
  "day2-whitepaper",
  "day2-codelab-1",
  "day2-codelab-2",
  "day3-podcast",
  "day3-whitepaper",
  "day3-codelab-1",
  "day3-codelab-2",
  "day4-podcast",
  "day4-whitepaper",
  "day4-codelab-1",
  "day4-codelab-2",
  "day5-capstone",
] as const;

// In-memory store for demo mode — resets on server restart, which is fine for local testing.
const demoProgress = new Set<string>();

function calculateStreak(completedAts: Date[]): number {
  if (completedAts.length === 0) return 0;
  const days = new Set(completedAts.map((d) => new Date(d).toDateString()));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (days.has(d.toDateString())) streak++;
    else break;
  }
  return streak;
}


export async function GET() {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (DEMO_MODE) {
    const completedStepIds = Array.from(demoProgress);
    const nextStepId = STEP_ORDER.find((id) => !completedStepIds.includes(id)) ?? null;
    return NextResponse.json({ completedStepIds, streak: completedStepIds.length > 0 ? 1 : 0, nextStepId });
  }

  // Real DB path
  const { db } = await import("@/lib/db");
  const { progress, users } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  await db.insert(users).values({ id: userId, email: `user-${userId}@agentpath.app`, displayName: "Learner" }).onConflictDoNothing();
  const rows = await db.select().from(progress).where(eq(progress.userId, userId));
  const completedStepIds = rows.map((r) => r.stepId);
  const streak = calculateStreak(rows.map((r) => r.completedAt));
  const nextStepId = STEP_ORDER.find((id) => !completedStepIds.includes(id)) ?? null;
  return NextResponse.json({ completedStepIds, streak, nextStepId });
}

export async function POST(req: Request) {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = z.object({ stepId: z.string().min(1) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "stepId is required" }, { status: 422 });
  const { stepId } = parsed.data;

  if (DEMO_MODE) {
    demoProgress.add(stepId);
    const completedStepIds = Array.from(demoProgress);
    const nextStepId = STEP_ORDER.find((id) => !completedStepIds.includes(id)) ?? null;
    return NextResponse.json({ ok: true, nextStepId });
  }

  // Real DB path
  const { db } = await import("@/lib/db");
  const { progress, users } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  await db.insert(users).values({ id: userId, email: `user-${userId}@agentpath.app`, displayName: "Learner" }).onConflictDoNothing();
  const existing = await db.select().from(progress).where(eq(progress.userId, userId));
  if (!existing.some((r) => r.stepId === stepId)) {
    await db.insert(progress).values({ id: crypto.randomUUID(), userId, stepId });
  }
  const all = await db.select().from(progress).where(eq(progress.userId, userId));
  const completedStepIds = all.map((r) => r.stepId);
  const nextStepId = STEP_ORDER.find((id) => !completedStepIds.includes(id)) ?? null;
  return NextResponse.json({ ok: true, nextStepId });
}
