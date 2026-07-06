import { auth } from "@clerk/nextjs/server";
import { DEMO_MODE, DEMO_USER_ID } from "@/lib/demo";

const MODULE_CONTENT: Record<number, string> = {
  1: "Day 1: Introduction to Agents & Vibe Coding — vibe coding, agentic SDLC, factory model.",
  2: "Day 2: Agent Tools & Interoperability — MCP, Agent2Agent (A2A), A2UI, AP2, UCP protocols.",
  3: "Day 3: Agent Skills — SKILL.md, progressive disclosure, context rot prevention.",
  4: "Day 4: Vibe Coding Agent Security & Evaluation — 7-pillar Effective Trust, ephemeral sandboxing, slopsquatting.",
  5: "Day 5: Capstone — apply 3+ course concepts across any track.",
};

const DEMO_RESPONSES: Record<number, string[]> = {
  1: [
    "Great question about vibe coding! The key insight is that you're shifting from *writing* syntax to *describing intent*. Instead of thinking 'how do I loop over this array,' you think 'I want to transform each item into X.' The agent handles the syntax — you handle the intent.\n\nWhat part of the agentic SDLC would you like to explore more?",
    "The factory model is a useful mental model here. Think of yourself as the architect on a factory floor — you specify the blueprint (your prompt), the factory (the AI) manufactures the output, and you do quality control (review + iterate).\n\nHave you tried the Antigravity IDE yet? What happened when you described your first component?",
    "That's a really common first reaction! The trick with vibe coding is specificity. Vague prompts get vague code. Try adding constraints: 'a button that does X, with Y styling, that calls Z function when clicked.' What specific thing are you trying to build?",
  ],
  2: [
    "MCP is fascinating — think of it like a USB port for AI models. Instead of every AI tool writing custom integrations for every data source, MCP creates one standard connector. The model plugs into MCP; MCP talks to your database, files, APIs.\n\nThe A2A protocol extends this to agent-to-agent communication. What part of the interoperability stack are you working through?",
    "Great question! The difference between A2A and MCP is the direction of communication. MCP connects an agent *to tools and resources*. A2A connects agents *to each other* — so one agent can delegate to another specialized agent.\n\nFor the codelab, what's the first step asking you to do?",
    "The Agent Payments Protocol (AP2) is where things get really interesting — agents that can autonomously complete purchases as part of a workflow. What use cases can you think of where that would be valuable?",
  ],
  3: [
    "Context rot is the key problem SKILL.md solves. Imagine a system prompt that started at 500 tokens and after 6 months of edits is now 8,000 tokens of contradictory instructions. The agent gets confused, costs skyrocket.\n\nSKILL.md treats agent context like software — versioned, modular, loaded on demand. What does your SKILL.md look like so far?",
    "Progressive disclosure is the art of only loading what you need, when you need it. A customer service agent doesn't need the full refund policy loaded unless the user asks about refunds.\n\nWhat skill are you trying to define? Walk me through what the agent needs to know.",
    "Good instinct! The `---` frontmatter in SKILL.md is metadata for the runtime — name, description, version. The body is the actual instructions loaded into the system prompt. The key discipline is: could I remove this paragraph and the agent would still behave correctly? If yes, remove it.",
  ],
  4: [
    "The 7-pillar Effective Trust framework is about one core question: *how much should I trust AI-generated code running in my system?* Spoiler: not blindly.\n\nEphemeral sandboxing is pillar one — every agent execution runs in a throwaway container. Why? Because an agent that can persist state across runs can be manipulated.\n\nWhich pillar are you studying?",
    "Slopsquatting is a real threat — when an AI hallucinates a package name like `lodash-utils-extra`, an attacker registers that name on npm with malicious code. The defense is dependency vetting: check every generated `import` against a known-good registry before running.\n\nFor the codelab, what does the threat scan step output for your code?",
    "The Red/Blue/Green triad is borrowed from military ops: Red team attacks (finds vulnerabilities), Blue team defends (patches them), Green team monitors (detects breaches in production). What does your expense approval agent look like so far?",
  ],
  5: [
    "This is where it all comes together! For the Freestyle track, the key is picking a use case you genuinely care about — the best capstones solve a real problem the builder has.\n\nYou need to demonstrate at least 3 course concepts. What concepts from Days 1–4 are you most excited to apply?",
    "Strong capstone projects do one thing really well rather than five things superficially. What's the single core user action in your app? Start there.\n\nAlso — this entire platform (AgentPath) is itself a Freestyle capstone! It uses MCP (Day 2), SKILL.md (Day 3), sandboxed AI endpoints (Day 4), and was vibe-coded (Day 1). Use it as inspiration.",
    "For the submission writeup, be explicit about which course concepts you're demonstrating and *where* in your code they appear. The judges want to see that you understand the concepts, not just that you used them.",
  ],
};

function* demoStream(moduleId: number, message: string): Generator<string> {
  const responses = DEMO_RESPONSES[moduleId] ?? DEMO_RESPONSES[1];
  // Pick a response based on message length for variety
  const response = responses[message.length % responses.length];
  // Stream word by word for realism
  const words = response.split(" ");
  for (const word of words) {
    yield word + " ";
  }
}

async function resolveUserId(): Promise<string | null> {
  if (DEMO_MODE) return DEMO_USER_ID;
  const { userId } = await auth();
  return userId;
}

export async function POST(req: Request) {
  const userId = await resolveUserId();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  let body: { moduleId?: unknown; message?: unknown };
  try { body = await req.json(); } catch {
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

  // Demo mode: stream a canned response
  if (DEMO_MODE) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const demoBanner = `> **Demo mode** — add your Anthropic API key in [/setup](/setup) for real AI responses.\n\n`;
        controller.enqueue(encoder.encode(demoBanner));
        await new Promise((r) => setTimeout(r, 300));
        for (const chunk of demoStream(mid, message.trim())) {
          controller.enqueue(encoder.encode(chunk));
          await new Promise((r) => setTimeout(r, 30));
        }
        controller.close();
      },
    });
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  // Real mode: Vercel AI SDK streaming
  const { anthropic } = await import("@ai-sdk/anthropic");
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
    .select()
    .from(tutorMessages)
    .where(and(eq(tutorMessages.userId, userId), eq(tutorMessages.moduleId, mid)))
    .orderBy(desc(tutorMessages.createdAt))
    .limit(10);

  const conversationMessages = history.reverse().map((m: { role: string; content: string }) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  await db.insert(tutorMessages).values({ id: crypto.randomUUID(), userId, moduleId: mid, role: "user", content: message.trim() });

  const systemPrompt = `${SKILL_MD}\n\n---\n\nThe learner is studying Day ${mid}.\nModule: ${MODULE_CONTENT[mid]}\n\nGuide — do not do the work for them.`;

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    instructions: systemPrompt,
    messages: [...conversationMessages, { role: "user", content: message.trim() }],
    tools: {
      get_module_content: tool({
        description: "Get content for a course day (1–5)",
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
