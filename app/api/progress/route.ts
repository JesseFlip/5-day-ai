/**
 * Progress API — tracks which steps a learner has completed.
 *
 * GET  /api/progress  → { completedStepIds, streak, nextStepId }
 * POST /api/progress  → { stepId: string } → { ok, nextStepId }
 *
 * On first GET for a user, a minimal user row is upserted (no webhook needed).
 *
 * Built by Claude via Lumbergh. Not a competition entry.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { progress, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Step ordering — used to compute nextStepId
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Upsert a minimal user row on first API call — avoids needing a Clerk webhook.
 */
async function ensureUser(userId: string): Promise<void> {
  await db
    .insert(users)
    .values({
      id: userId,
      email: `user-${userId}@agentpath.app`, // placeholder until webhook provides real email
      displayName: "Learner",
    })
    .onConflictDoNothing();
}

/**
 * Count consecutive days with at least one completion, counting back from today.
 * Streak breaks on the first day with no activity.
 */
function calculateStreak(completedAts: Date[]): number {
  if (completedAts.length === 0) return 0;

  const days = new Set(completedAts.map((d) => new Date(d).toDateString()));
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (days.has(d.toDateString())) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// ---------------------------------------------------------------------------
// GET /api/progress
// ---------------------------------------------------------------------------

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Upsert user row if this is their first visit
  await ensureUser(userId);

  const rows = await db
    .select()
    .from(progress)
    .where(eq(progress.userId, userId));

  const completedStepIds = rows.map((r) => r.stepId);
  const streak = calculateStreak(rows.map((r) => r.completedAt));
  const nextStepId =
    STEP_ORDER.find((id) => !completedStepIds.includes(id)) ?? null;

  return NextResponse.json({ completedStepIds, streak, nextStepId });
}

// ---------------------------------------------------------------------------
// POST /api/progress
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = z.object({ stepId: z.string().min(1) }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "stepId is required", details: parsed.error.issues },
      { status: 422 }
    );
  }
  const { stepId } = parsed.data;

  // Upsert user row (idempotent)
  await ensureUser(userId);

  // Check whether this step is already recorded — keep it idempotent
  const existing = await db
    .select()
    .from(progress)
    .where(eq(progress.userId, userId));

  if (!existing.some((r) => r.stepId === stepId)) {
    await db.insert(progress).values({
      id: crypto.randomUUID(),
      userId,
      stepId,
    });
  }

  // Re-fetch to compute the next step
  const all = await db
    .select()
    .from(progress)
    .where(eq(progress.userId, userId));

  const completedStepIds = all.map((r) => r.stepId);
  const nextStepId =
    STEP_ORDER.find((id) => !completedStepIds.includes(id)) ?? null;

  return NextResponse.json({ ok: true, nextStepId });
}
