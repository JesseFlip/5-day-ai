import { NextResponse } from "next/server";
import { getUserId as resolveUserId } from "@/lib/auth";
import { DEMO_MODE } from "@/lib/demo";
import { STATIC_HINTS } from "@/lib/content/hints";

// Demo in-memory store (resets on server restart — fine for local testing)
export const demoHintReveals = new Map<string, Set<number>>();


export async function GET(
  _req: Request,
  { params }: { params: Promise<{ stepId: string }> }
) {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { stepId } = await params;
  const hints = STATIC_HINTS[stepId] ?? [];
  const maxTier = hints.length;

  if (DEMO_MODE) {
    const key = `${userId}:${stepId}`;
    const revealedTiers = Array.from(demoHintReveals.get(key) ?? []);
    const revealed = hints.filter((h) => revealedTiers.includes(h.tier)).map((h) => ({ tier: h.tier, content: h.content }));
    const highestRevealed = Math.max(...revealedTiers, 0);
    return NextResponse.json({ revealed, nextTier: highestRevealed + 1 > maxTier ? null : highestRevealed + 1, maxTier });
  }

  const { db } = await import("@/lib/db");
  const { hintReveal } = await import("@/lib/db/schema");
  const { eq, and } = await import("drizzle-orm");

  const reveals = await db.select().from(hintReveal).where(and(eq(hintReveal.userId, userId), eq(hintReveal.stepId, stepId)));
  const revealedTiers = reveals.map((r) => r.tier as number);
  const revealed = hints.filter((h) => revealedTiers.includes(h.tier)).map((h) => ({ tier: h.tier, content: h.content }));
  const highestRevealedTier = Math.max(...revealedTiers, 0);
  return NextResponse.json({ revealed, nextTier: highestRevealedTier + 1 > maxTier ? null : highestRevealedTier + 1, maxTier });
}
