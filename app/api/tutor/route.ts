import { getUserId as resolveUserId } from "@/lib/auth";
import { DEMO_MODE } from "@/lib/demo";

export type TutorModel = "claude" | "gemini";

// Streaming LLM responses can outlast the default function timeout.
export const maxDuration = 60;

const MODULE_CONTENT: Record<number, string> = {
  1: "Day 1: Introduction to Agents & Vibe Coding — vibe coding, agentic SDLC, factory model.",
  2: "Day 2: Agent Tools & Interoperability — MCP, Agent2Agent (A2A), A2UI, AP2, UCP protocols.",
  3: "Day 3: Agent Skills — SKILL.md, progressive disclosure, context rot prevention.",
  4: "Day 4: Vibe Coding Agent Security & Evaluation — 7-pillar Effective Trust, ephemeral sandboxing, slopsquatting.",
  5: "Day 5: Capstone — apply 3+ course concepts across any track.",
};

const DEMO_RESPONSES: Record<number, string[]> = {
  1: [
    "> **Demo mode** — add your Anthropic or Gemini API key in [/setup](/setup) for real AI responses.\n\nGreat question about vibe coding! The key insight is that you're shifting from *writing* syntax to *describing intent*. Instead of thinking 'how do I loop over this array,' you think 'I want to transform each item into X.' The agent handles the syntax — you handle the intent.\n\nWhat part of the agentic SDLC would you like to explore more?",
    "> **Demo mode** — add your API key in [/setup](/setup) for live AI tutoring.\n\nThe factory model is a useful mental model. Think of yourself as the architect on a factory floor — you specify the blueprint (your prompt), the factory (the AI) manufactures the output, and you do quality control (review + iterate).\n\nHave you tried the Antigravity IDE yet?",
  ],
  2: [
    "> **Demo mode** — add your API key in [/setup](/setup) for live AI tutoring.\n\nMCP is like a USB port for AI models. Instead of every tool writing custom integrations, MCP creates one standard connector. What part of the interoperability stack are you working through?",
    "> **Demo mode** — add your API key in [/setup](/setup) for live AI tutoring.\n\nA2A (Agent-to-Agent) extends MCP to agent-to-agent communication — so one agent can delegate tasks to another specialized agent. What use case are you thinking about?",
  ],
  3: [
    "> **Demo mode** — add your API key in [/setup](/setup) for live AI tutoring.\n\nContext rot is the core problem SKILL.md solves. Imagine a system prompt that grew from 500 to 8,000 tokens over 6 months of edits — contradictory, bloated. SKILL.md treats agent context like software: versioned, modular, loaded on demand. What skill are you trying to define?",
    "> **Demo mode** — add your API key in [/setup](/setup) for live AI tutoring.\n\nProgressive disclosure means only loading context when needed. A refund agent doesn't need the full policy loaded unless the user asks about refunds. How would you structure your SKILL.md sections?",
  ],
  4: [
    "> **Demo mode** — add your API key in [/setup](/setup) for live AI tutoring.\n\nThe 7-pillar Effective Trust framework answers: how much should you trust AI-generated code? Ephemeral sandboxing (pillar 1) means every agent execution runs in a throwaway container. Which pillar are you studying?",
    "> **Demo mode** — add your API key in [/setup](/setup) for live AI tutoring.\n\nSlopsquatting is real — when an AI hallucinates a package name like `lodash-utils-extra`, an attacker registers it on npm with malicious code. Dependency vetting catches this. What does your threat scan output look like?",
  ],
  5: [
    "> **Demo mode** — add your API key in [/setup](/setup) for live AI tutoring.\n\nFor the Freestyle track, the best capstones solve a problem the builder genuinely has. You need 3+ course concepts — which ones from Days 1–4 are you most excited to apply?\n\nP.S. This entire platform (AgentPath) is itself a Freestyle capstone: MCP (Day 2), SKILL.md (Day 3), sandboxed AI endpoints (Day 4), vibe-coded (Day 1).",
    "> **Demo mode** — add your API key in [/setup](/setup) for live AI tutoring.\n\nStrong capstones do one thing really well. What's the single core user action in your app? Start there, and expand outward.",
  ],
};

function* demoStream(moduleId: number, message: string): Generator<string> {
  const responses = DEMO_RESPONSES[moduleId] ?? DEMO_RESPONSES[1];
  const response = responses[message.length % responses.length];
  for (const word of response.split(" ")) {
    yield word + " ";
  }
}


export async function POST(req: Request) {
  const userId = await resolveUserId();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  let body: { moduleId?: unknown; message?: unknown; model?: unknown };
  try { body = await req.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { moduleId, message, model } = body;
  if (!message || typeof message !== "string" || message.trim().length === 0 || message.length > 2000) {
    return Response.json({ error: "Invalid message" }, { status: 400 });
  }
  const mid = Number(moduleId);
  if (!moduleId || isNaN(mid) || mid < 1 || mid > 5) {
    return Response.json({ error: "Invalid moduleId" }, { status: 400 });
  }
  const selectedModel: TutorModel = model === "gemini" ? "gemini" : "claude";

  // Demo mode: stream canned response
  if (DEMO_MODE) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for (const chunk of demoStream(mid, message.trim())) {
          controller.enqueue(encoder.encode(chunk));
          await new Promise((r) => setTimeout(r, 25));
        }
        controller.close();
      },
    });
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  // Real mode
  const { streamText, tool, createTextStreamResponse } = await import("ai");
  const { z } = await import("zod");
  const { db } = await import("@/lib/db");
  const { tutorMessages } = await import("@/lib/db/schema");
  const { checkRateLimit } = await import("@/lib/rate-limit");
  const { readFileSync } = await import("fs");
  const { join } = await import("path");
  const { eq, and, desc } = await import("drizzle-orm");

  const { success, retryAfter } = await checkRateLimit(userId, "tutor", 20, 3600);
  if (!success) return Response.json({ error: "Rate limit exceeded", retryAfter }, { status: 429 });

  const SKILL_MD = readFileSync(join(process.cwd(), "lib/agents/tutor/SKILL.md"), "utf-8");

  const history = await db
    .select().from(tutorMessages)
    .where(and(eq(tutorMessages.userId, userId), eq(tutorMessages.moduleId, mid)))
    .orderBy(desc(tutorMessages.createdAt)).limit(10);

  const conversationMessages = history.reverse().map((m: { role: string; content: string }) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  await db.insert(tutorMessages).values({ id: crypto.randomUUID(), userId, moduleId: mid, role: "user", content: message.trim() });

  // Pick model
  let aiModel;
  if (selectedModel === "gemini") {
    const { google } = await import("@ai-sdk/google");
    aiModel = google(process.env.GEMINI_MODEL ?? "gemini-3.5-flash");
  } else {
    const { anthropic } = await import("@ai-sdk/anthropic");
    aiModel = anthropic("claude-sonnet-4-6");
  }

  const systemPrompt = `${SKILL_MD}\n\n---\n\nLearner is on Day ${mid}.\nModule: ${MODULE_CONTENT[mid]}\n\nBe Socratic — guide, don't solve.`;

  const result = streamText({
    model: aiModel,
    instructions: systemPrompt,
    messages: [...conversationMessages, { role: "user", content: message.trim() }],
    tools: {
      get_module_content: tool({
        description: "Get content summary for a course day (1–5)",
        inputSchema: z.object({ day: z.number().min(1).max(5) }),
        execute: async ({ day }: { day: number }) => MODULE_CONTENT[day] ?? "Not found",
      }),
    },
    onEnd: async ({ text }: { text: string }) => {
      if (text) await db.insert(tutorMessages).values({ id: crypto.randomUUID(), userId, moduleId: mid, role: "assistant", content: text });
    },
  });

  return createTextStreamResponse({ stream: result.textStream });
}
