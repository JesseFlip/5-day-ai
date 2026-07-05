import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { hintReveal } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { STATIC_HINTS } from "@/lib/content/hints";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ stepId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { stepId } = await params;

  const reveals = await db
    .select()
    .from(hintReveal)
    .where(and(eq(hintReveal.userId, userId), eq(hintReveal.stepId, stepId)));

  const revealedTiers = reveals.map((r) => r.tier as number);
  const hints = STATIC_HINTS[stepId] ?? [];
  const revealed = hints
    .filter((h) => revealedTiers.includes(h.tier))
    .map((h) => ({ tier: h.tier, content: h.content }));

  const maxTier = hints.length; // 4 tiers available per step
  const highestRevealedTier = Math.max(...revealedTiers, 0);
  const nextTier = highestRevealedTier + 1;

  return NextResponse.json({
    revealed,
    nextTier: nextTier > maxTier ? null : nextTier,
    maxTier,
  });
}
