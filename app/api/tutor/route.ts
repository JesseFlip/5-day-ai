import { anthropic } from "@ai-sdk/anthropic";
import { streamText, tool, createTextStreamResponse } from "ai";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { tutorMessages } from "@/lib/db/schema";
import { checkRateLimit } from "@/lib/rate-limit";
import { readFileSync } from "fs";
import { join } from "path";
import { eq, and, desc } from "drizzle-orm";

const SKILL_MD = readFileSync(
  join(process.cwd(), "lib/agents/tutor/SKILL.md"),
  "utf-8"
);

const MODULE_CONTENT: Record<number, string> = {
  1: "Day 1: Introduction to Agents & Vibe Coding — vibe coding, agentic SDLC, factory model. Podcast: https://www.youtube.com/watch?v=cbzmr7vt4XA. Whitepaper: https://www.kaggle.com/whitepaper-the-new-SDLC-with-vibe-coding",
  2: "Day 2: Agent Tools & Interoperability — MCP, Agent2Agent (A2A), A2UI, AP2, UCP protocols. Podcast: https://www.youtube.com/watch?v=GjjKXqxFTOY. Whitepaper: https://www.kaggle.com/whitepaper-agent-tools-and-interoperability",
  3: "Day 3: Agent Skills — SKILL.md, progressive disclosure, context rot prevention. Podcast: https://www.youtube.com/watch?v=uYURYHhpmKc. Whitepaper: https://www.kaggle.com/whitepaper-agent-skills",
  4: "Day 4: Vibe Coding Agent Security & Evaluation — 7-pillar Effective Trust, ephemeral sandboxing, slopsquatting, Red/Blue/Green triad, OpenTelemetry trajectory evaluation. Podcast: https://www.youtube.com/watch?v=Ddz1b8CYPvg. Whitepaper: https://www.kaggle.com/whitepaper-vibe-coding-agent-security-and-evaluation",
  5: "Day 5: Capstone — apply 3+ course concepts (ADK, MCP, agent skills, security). Four tracks: Agents for Good, Business, Concierge, Freestyle. Deadline: July 6 2026.",
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { success, retryAfter } = await checkRateLimit(userId, "tutor", 20, 3600);
  if (!success) {
    return Response.json({ error: "Rate limit exceeded", retryAfter }, { status: 429 });
  }

  let body: { moduleId?: unknown; message?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { moduleId, message } = body;

  if (!message || typeof message !== "string" || message.trim().length === 0 || message.length > 2000) {
    return Response.json({ error: "Invalid message" }, { status: 400 });
  }
  const mid = Number(moduleId);
  if (!moduleId || isNaN(mid) || mid < 1 || mid > 5) {
    return Response.json({ error: "Invalid moduleId" }, { status: 400 });
  }

  // Load conversation history (last 10 turns)
  const history = await db
    .select()
    .from(tutorMessages)
    .where(and(eq(tutorMessages.userId, userId), eq(tutorMessages.moduleId, mid)))
    .orderBy(desc(tutorMessages.createdAt))
    .limit(10);

  const conversationMessages = history.reverse().map((m: { role: string; content: string }) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Save the incoming user message before streaming starts
  await db.insert(tutorMessages).values({
    id: crypto.randomUUID(),
    userId,
    moduleId: mid,
    role: "user",
    content: message.trim(),
  });

  const systemPrompt = `${SKILL_MD}

---

The learner is currently studying Day ${mid} of the course.
Current module content: ${MODULE_CONTENT[mid] ?? "Unknown module"}

Remember: you are a Socratic tutor. Guide the learner to understanding — do not do the work for them.`;

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    instructions: systemPrompt,
    messages: [
      ...conversationMessages,
      { role: "user", content: message.trim() },
    ],
    tools: {
      get_module_content: tool({
        description: "Get structured content summary for a specific course day (1–5)",
        inputSchema: z.object({
          day: z.number().min(1).max(5).describe("Course day number (1–5)"),
        }),
        execute: async ({ day }: { day: number }) => MODULE_CONTENT[day] ?? "Module not found",
      }),
    },
    onEnd: async ({ text }) => {
      if (text) {
        await db.insert(tutorMessages).values({
          id: crypto.randomUUID(),
          userId,
          moduleId: mid,
          role: "assistant",
          content: text,
        });
      }
    },
  });

  return createTextStreamResponse({ stream: result.textStream });
}
