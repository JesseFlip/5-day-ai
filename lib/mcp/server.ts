/**
 * AgentPath MCP Curriculum Server
 *
 * Exposes Kaggle 5-Day AI Agents course curriculum as MCP resources.
 * URI scheme: agentpath://modules/1 through agentpath://modules/5
 *
 * This file is the standalone stdio-transport version.
 * The HTTP/JSON-RPC version lives at app/api/mcp/route.ts.
 *
 * Built by Claude via Lumbergh for the AgentPath capstone.
 * Not a competition entry — shared openly.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// ---------------------------------------------------------------------------
// Curriculum data
// ---------------------------------------------------------------------------

interface Module {
  title: string;
  focusSummary: string;
  podcastUrl: string;
  whitepaperUrl: string;
  codelabs: string[];
}

const CURRICULUM: Record<number, Module> = {
  1: {
    title: "Introduction to Agents & Vibe Coding",
    focusSummary:
      "Transition from manual syntax coding to intent-driven 'vibe coding' — describing what you want in natural language and letting the agent produce the implementation. The factory model positions developers as orchestrators who define intent, review output, and iterate rather than write every line. This day establishes how the agentic SDLC compresses development cycles by delegating routine coding tasks to AI, and introduces the Antigravity IDE as the primary environment for the course's hands-on exercises.",
    podcastUrl: "https://www.youtube.com/watch?v=cbzmr7vt4XA",
    whitepaperUrl: "https://www.kaggle.com/whitepaper-the-new-SDLC-with-vibe-coding",
    codelabs: [
      "Get started with Antigravity 2.0 & IDE",
      "Build a Web App in AI Studio & Deploy to Cloud Run",
    ],
  },
  2: {
    title: "Agent Tools & Interoperability",
    focusSummary:
      "Open protocols enable a plug-and-play AI ecosystem where agents from different vendors and frameworks can communicate, share tools, and exchange payments without custom integration work. This day covers five protocols: Model Context Protocol (MCP) for connecting agents to tools and data sources; Agent2Agent (A2A) for direct agent-to-agent communication; Agent-to-User Interface (A2UI) for rendering rich UI within agent conversations; Agent Payments Protocol (AP2) for autonomous micro-transactions; and Universal Commerce Protocol (UCP) for multi-step commercial workflows. Together these protocols define how a modern interoperable agent ecosystem operates.",
    podcastUrl: "https://www.youtube.com/watch?v=GjjKXqxFTOY",
    whitepaperUrl: "https://www.kaggle.com/whitepaper-agent-tools-and-interoperability",
    codelabs: [
      "Get started with Antigravity CLI",
      "Explore Google Developer Knowledge MCP server in Antigravity",
    ],
  },
  3: {
    title: "Agent Skills",
    focusSummary:
      "Long system prompts degrade over time as agents accumulate context — a phenomenon called 'context rot'. Agent Skills solve this by packaging domain knowledge into portable, version-controlled directories built around a central SKILL.md file. A skill includes the agent's role, behavioral rules, tool definitions, and reference documents, loaded on demand rather than baked into every system prompt. Progressive disclosure means the agent only loads the context it needs for the current task, keeping prompts lightweight and behavior predictable. This day covers authoring, versioning, and composing Agent Skills.",
    podcastUrl: "https://www.youtube.com/watch?v=uYURYHhpmKc",
    whitepaperUrl: "https://www.kaggle.com/whitepaper-agent-skills",
    codelabs: [
      "Explore how Skills work in Antigravity",
      "Build agents in Antigravity with Agents CLI and ADK",
    ],
  },
  4: {
    title: "Vibe Coding Agent Security and Evaluation",
    focusSummary:
      "AI-generated code introduces security risks that traditional static analysis misses. This day covers the 7-pillar 'Effective Trust' architecture for securing agent workflows: ephemeral sandboxing (each execution in a disposable container), dependency vetting (defending against 'slopsquatting' — hallucinated package names that attackers register), a Red/Blue/Green security triad (attack simulation, defense hardening, monitoring), and OpenTelemetry trajectory evaluation (structured telemetry that records every agent action for audit and debugging). Evaluation is treated as a first-class engineering practice, not an afterthought.",
    podcastUrl: "https://www.youtube.com/watch?v=Ddz1b8CYPvg",
    whitepaperUrl:
      "https://www.kaggle.com/whitepaper-vibe-coding-agent-security-and-evaluation",
    codelabs: [
      "Expense-approval agent with human-in-the-loop triage & local evals",
      "Write Secure AI Code — threat scans, safety guards, security testing",
    ],
  },
  5: {
    title: "Capstone Project",
    focusSummary:
      "The capstone challenges you to apply at least three concepts from Days 1–4 to a real-world use case. You choose one of four tracks: Agents for Good (social impact), Agents for Business (commercial applications), Concierge Agents (personal assistant style), or the Freestyle Track (open-ended). Submissions are individual or team (up to 4 people). The capstone demonstrates that you can design, build, secure, and deploy a working AI agent system — not just understand the theory.",
    podcastUrl: "",
    whitepaperUrl: "",
    codelabs: [],
  },
};

// ---------------------------------------------------------------------------
// Resource helpers
// ---------------------------------------------------------------------------

function buildResourceText(day: number, mod: Module): string {
  const lines: string[] = [
    `# Day ${day}: ${mod.title}`,
    ``,
    `## Summary`,
    mod.focusSummary,
    ``,
  ];

  if (mod.podcastUrl) {
    lines.push(`## Podcast`, mod.podcastUrl, ``);
  }
  if (mod.whitepaperUrl) {
    lines.push(`## Whitepaper`, mod.whitepaperUrl, ``);
  }
  if (mod.codelabs.length > 0) {
    lines.push(
      `## Codelabs`,
      ...mod.codelabs.map((c, i) => `${i + 1}. ${c}`),
      ``
    );
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Server factory
// ---------------------------------------------------------------------------

export function createMcpServer(): Server {
  const server = new Server(
    { name: "agentpath-curriculum", version: "1.0.0" },
    { capabilities: { resources: {} } }
  );

  // resources/list — enumerate all 5 modules
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: ([1, 2, 3, 4, 5] as const).map((day) => ({
      uri: `agentpath://modules/${day}`,
      name: `Day ${day}: ${CURRICULUM[day].title}`,
      description: `Day ${day} curriculum content for the Kaggle 5-Day AI Agents course`,
      mimeType: "text/plain",
    })),
  }));

  // resources/read — return full module content
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri: string = request.params.uri;
    const match = uri.match(/^agentpath:\/\/modules\/(\d)$/);

    if (!match) {
      throw new Error(`Unknown resource URI: ${uri}`);
    }

    const day = parseInt(match[1], 10);
    const mod = CURRICULUM[day];

    if (!mod) {
      throw new Error(`Module not found: day ${day}`);
    }

    return {
      contents: [
        {
          uri,
          mimeType: "text/plain",
          text: buildResourceText(day, mod),
        },
      ],
    };
  });

  return server;
}

// ---------------------------------------------------------------------------
// Entrypoint — run as stdio MCP server when executed directly
// ---------------------------------------------------------------------------

async function main() {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Server keeps running, listening on stdin
}

main().catch((err) => {
  console.error("MCP server fatal error:", err);
  process.exit(1);
});
