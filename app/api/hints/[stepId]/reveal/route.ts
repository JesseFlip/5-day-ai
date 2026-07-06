import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { DEMO_MODE, DEMO_USER_ID } from "@/lib/demo";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { STATIC_HINTS } from "@/lib/content/hints";

const bodySchema = z.object({
  tier: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  confirmed: z.boolean().optional(),
});

// In-memory demo store for hint reveals
const demoReveals = new Map<string, Set<number>>();

async function resolveUserId(): Promise<string | null> {
  if (DEMO_MODE) return DEMO_USER_ID;
  const { userId } = await auth();
  return userId;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ stepId: string }> }
) {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { stepId } = await params;

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const { tier, confirmed } = parsed.data;
  if (tier === 4 && !confirmed) {
    return NextResponse.json({ error: "Tier 4 requires confirmed: true", needsConfirmation: true }, { status: 400 });
  }

  const { success } = await checkRateLimit(userId, `hint:${stepId}`, 5, 3600);
  if (!success) return NextResponse.json({ error: "Too many hint reveals. Try again later." }, { status: 429 });

  const hints = STATIC_HINTS[stepId];
  if (!hints) return NextResponse.json({ error: "No hints available for this step" }, { status: 404 });

  const hint = hints.find((h) => h.tier === tier);
  if (!hint) return NextResponse.json({ error: "Hint tier not found" }, { status: 404 });

  if (DEMO_MODE) {
    const key = `${userId}:${stepId}`;
    if (!demoReveals.has(key)) demoReveals.set(key, new Set());
    demoReveals.get(key)!.add(tier);
    return NextResponse.json({ content: hint.content, tier });
  }

  const { db } = await import("@/lib/db");
  const { hintReveal } = await import("@/lib/db/schema");
  await db.insert(hintReveal).values({ id: crypto.randomUUID(), userId, stepId, tier }).onConflictDoNothing();
  return NextResponse.json({ content: hint.content, tier });
}
