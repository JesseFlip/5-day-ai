import type { ModuleData, StepData } from "@/lib/types";

export const MODULES: ModuleData[] = [
  {
    id: 1,
    slug: "intro-agents-vibe-coding",
    title: "Day 1 — Introduction to Agents & Vibe Coding",
    focusSummary: `The first day introduces the single most important paradigm shift in the course: moving from traditional "syntax coding" — where developers manually write every line, navigate API documentation, and debug through stack traces — to "vibe coding," an intent-driven approach where you describe what you want and AI agents handle the mechanical implementation details.\n\nYou will learn how this shift compresses the software development lifecycle (SDLC) dramatically, what Google calls the "factory model" of AI-assisted development, where agents can take a product specification from idea to production-ready code in a fraction of the traditional timeline. Instead of spending 80% of development time on boilerplate, dependency management, and syntax errors, developers shift their energy toward product thinking, architecture decisions, and quality evaluation.\n\nThe module covers Google's Antigravity platform — an AI-native IDE designed from the ground up for intent-driven development — and you'll get hands-on experience deploying a complete web application to Google Cloud Run directly from AI Studio. You'll explore the prompting techniques that make vibe coding effective: specificity in problem framing, context-setting for the agent, and iterative refinement when the first output misses the mark.\n\nKey concepts include the difference between "copilot" mode (autocomplete-style assistance) and "agent" mode (autonomous multi-step task execution), and the architectural patterns for building production-grade applications with AI assistance. You'll also get an early preview of "context rot" — the gradual degradation of AI output quality as context windows fill with irrelevant history — and learn why it is the central design challenge that the rest of the course addresses.`,
    podcastUrl: "https://www.youtube.com/watch?v=cbzmr7vt4XA",
    whitepaperUrl: "https://www.kaggle.com/whitepaper-the-new-SDLC-with-vibe-coding",
    order: 1,
  },
  {
    id: 2,
    slug: "agent-tools-interoperability",
    title: "Day 2 — Agent Tools & Interoperability",
    focusSummary: `Day 2 dives into the open protocols that make AI agents interoperable across different platforms, tools, and vendors — the plumbing layer that transforms isolated AI assistants into a coordinated ecosystem. The centerpiece is the Model Context Protocol (MCP), which standardizes how AI agents discover and call external tools, whether that's querying a database, browsing the web, running a code interpreter, or calling a payment API. You'll learn why MCP has become the industry's de-facto "USB port" for AI capabilities and how to wire it into your own projects.\n\nBeyond MCP, the module covers four other emerging protocols that together define what it means for agents to interoperate at scale. Agent2Agent (A2A) enables direct agent-to-agent communication and task delegation — agents that can hire sub-agents, review their work, and compose multi-step pipelines without human orchestration. A2UI addresses the underappreciated challenge of agents that interact with browser-based user interfaces without brittle screen-capture heuristics. The Agent Payments Protocol (AP2) formalizes how agents can autonomously initiate and authorize financial transactions within configurable guardrails. The Universal Commerce Protocol (UCP) completes the picture with multi-step purchasing flows that span multiple vendors and fulfillment systems.\n\nThe codelabs are practical and progressive: you'll configure the Antigravity CLI locally, connect it to a live MCP server, and wire up the Google Developer Knowledge MCP server to give your agent real-time access to the latest Google APIs and SDK documentation. This demonstrates a key motivation for interoperability protocols: keeping agents up-to-date with a fast-moving technology landscape without retraining them. By the end of this module, you'll understand both the opportunity and the security challenges when agents operate on your behalf.`,
    podcastUrl: "https://www.youtube.com/watch?v=GjjKXqxFTOY",
    whitepaperUrl: "https://www.kaggle.com/whitepaper-agent-tools-and-interoperability",
    order: 2,
  },
  {
    id: 3,
    slug: "agent-skills",
    title: "Day 3 — Agent Skills",
    focusSummary: `Context management is one of the hardest practical problems in AI agent deployment. Every model has a finite context window, and as conversations or autonomous tasks grow longer, older context gets pushed out — leading to "context rot" where the agent loses track of project-specific conventions, past decisions, and domain knowledge. Day 3 introduces Agent Skills (SKILL.md files) as a lightweight, portable, version-controllable solution: structured markdown documents that act as persistent memory for agents, encoding everything they need to know about a codebase, workflow, or task domain.\n\nYou'll learn what to put in a SKILL.md file — project conventions, available tools, decision rationale, known failure modes, and coding style guidelines — and how to structure them for progressive disclosure. Progressive disclosure is the key architectural insight: instead of front-loading every bit of context into every prompt (wasting tokens and degrading generation quality), skills are loaded on-demand based on what task the agent is working on. An agent writing a database migration loads the migration skill; the same agent writing a React component loads the frontend skill. Both reference the shared project overview skill.\n\nThe module covers the broader skill lifecycle: generating initial skills from existing codebases using AI, updating them as projects evolve, sharing them across teams via version control, and composing multi-skill pipelines for complex workflows. The Antigravity Agents CLI is introduced as the command-line companion to the IDE, and the ADK (Agent Development Kit) provides programmatic APIs for building custom multi-step agent workflows. The ADK agent lifecycle — plan, act, observe, reflect — maps directly to how effective human developers approach complex tasks. The codelabs walk you through creating skills for a real project and show how skills dramatically extend the distance an agent can travel without losing its way.`,
    podcastUrl: "https://www.youtube.com/watch?v=uYURYHhpmKc",
    whitepaperUrl: "https://www.kaggle.com/whitepaper-agent-skills",
    order: 3,
  },
  {
    id: 4,
    slug: "agent-security-evaluation",
    title: "Day 4 — Vibe Coding Agent Security and Evaluation",
    focusSummary: `As AI agents take on real-world tasks — committing code, calling APIs, making purchases, sending messages on your behalf — security is no longer optional. Day 4 presents a 7-pillar "Effective Trust" architecture for building AI agents that are safe by design, not just safe by luck. The seven pillars address: ephemeral sandboxing (agents that run in disposable environments that reset after each task, preventing persistence of compromised state), least-privilege API access (scoping agent credentials tightly to what's needed for the current task), prompt injection defenses (detecting and rejecting attempts to hijack agent behavior via malicious content in the environment), output validation (checking agent-produced code, messages, and API calls before they're executed), audit trails (recording the full decision path for post-incident analysis), and more.\n\nThe module gives particular attention to "slopsquatting" — a risk unique to AI-generated code where models hallucinate plausible-but-nonexistent package names, which malicious actors pre-register on npm or PyPI. You'll learn to defend against this with dependency pinning, package verification checks, and AI-powered scanning of generated dependency lists.\n\nThe Red/Blue/Green security triad gives you a practical mental model for the people dimension: Red Teams probe agents adversarially with prompt injection attempts and jailbreak probes; Blue Teams monitor production agents for anomalous behavior, maintain alerting pipelines, and run incident response; Green Teams do proactive hardening and policy enforcement. You'll learn OpenTelemetry-based trajectory evaluation — recording each step of an agent's decision path as a structured trace and scoring it against expected behavior to catch drift before it becomes a production incident. The codelabs are highly practical: building an expense-approval agent with human-in-the-loop triage, and auditing AI-generated code with static analysis and threat scanning tools.`,
    podcastUrl: "https://www.youtube.com/watch?v=Ddz1b8CYPvg",
    whitepaperUrl: "https://www.kaggle.com/whitepaper-vibe-coding-agent-security-and-evaluation",
    order: 4,
  },
  {
    id: 5,
    slug: "capstone-project",
    title: "Day 5 — Capstone Project",
    focusSummary: `The capstone is your opportunity to synthesize everything from the course — vibe coding workflows, interoperability protocols, agent skills, security best practices, and evaluation frameworks — into a real, working AI agent application. There is no lecture content for Day 5. The day is entirely project time. Your submission must apply at least three concepts from the five course days, and must include clear documentation of your architecture and design decisions.\n\nFour tracks are available to match your interests and context. The Agents for Good track challenges you to build an agent that addresses a civic, environmental, humanitarian, or educational need: think an agent that helps non-profits automate grant application writing, monitors air quality data and generates accessible community reports, or assists educators in creating personalized learning materials. Agents for Business is the professional track: build an agent that automates a real business workflow — customer support triage, invoice processing, competitive intelligence, sales enablement — with demonstrable ROI and integration into an existing system via MCP or A2A.\n\nConcierge Agents focuses on personalization: build an agent that acts as a proactive, context-aware assistant for a specific domain (travel planning, study scheduling, health tracking, financial review). The key differentiator here is memory — the agent should know you well enough to act autonomously in low-stakes situations and know when to ask before acting in high-stakes ones. The Freestyle Track is for anything outside these categories: novel interaction paradigms, developer tools, creative applications, research assistants. If it's an interesting agentic use case that you're genuinely excited about, it qualifies. Submit your project via the Kaggle competition page linked below.`,
    podcastUrl: "",
    whitepaperUrl: "",
    order: 5,
  },
];

export const STEPS: StepData[] = [
  // Day 1
  {
    id: "day1-podcast",
    moduleId: 1,
    type: "podcast",
    title: "Listen: Introduction to Agents & Vibe Coding",
    description:
      "A deep-dive conversation on the shift from syntax coding to intent-driven development, and how the 'factory model' rewrites the SDLC.",
    externalUrl: "https://www.youtube.com/watch?v=cbzmr7vt4XA",
    estimatedMinutes: 45,
    difficulty: "beginner",
    order: 1,
  },
  {
    id: "day1-whitepaper",
    moduleId: 1,
    type: "whitepaper",
    title: "Read: The New SDLC with Vibe Coding",
    description:
      "The official whitepaper covering the conceptual framework for AI-augmented development, the factory model, and its implications for software teams.",
    externalUrl: "https://www.kaggle.com/whitepaper-the-new-SDLC-with-vibe-coding",
    estimatedMinutes: 50,
    difficulty: "intermediate",
    order: 2,
  },
  {
    id: "day1-codelab-1",
    moduleId: 1,
    type: "codelab",
    title: "Lab: Get Started with Antigravity 2.0 & IDE",
    description:
      "Hands-on introduction to the Antigravity IDE — set up your environment, run your first agent-powered code generation, and explore the intent-driven workflow.",
    externalUrl: "https://codelabs.developers.google.com/getting-started-google-antigravity#0",
    estimatedMinutes: 60,
    difficulty: "beginner",
    order: 3,
  },
  {
    id: "day1-codelab-2",
    moduleId: 1,
    type: "codelab",
    title: "Lab: Build a Web App in AI Studio & Deploy to Cloud Run",
    description:
      "Build a complete web application using AI Studio's agent-first workflow and deploy it to Google Cloud Run — a full end-to-end vibe coding experience.",
    externalUrl: "https://codelabs.developers.google.com/deploy-from-aistudio-to-run?hl=en#0",
    estimatedMinutes: 75,
    difficulty: "intermediate",
    order: 4,
  },

  // Day 2
  {
    id: "day2-podcast",
    moduleId: 2,
    type: "podcast",
    title: "Listen: Agent Tools & Interoperability",
    description:
      "Explore MCP, Agent2Agent, A2UI, and the emerging protocol landscape that makes agents composable and interoperable across vendors.",
    externalUrl: "https://www.youtube.com/watch?v=GjjKXqxFTOY",
    estimatedMinutes: 45,
    difficulty: "beginner",
    order: 1,
  },
  {
    id: "day2-whitepaper",
    moduleId: 2,
    type: "whitepaper",
    title: "Read: Agent Tools and Interoperability",
    description:
      "Technical deep-dive into MCP, A2A, A2UI, AP2, and UCP — the open protocols enabling a composable, multi-vendor AI agent ecosystem.",
    externalUrl: "https://www.kaggle.com/whitepaper-agent-tools-and-interoperability",
    estimatedMinutes: 50,
    difficulty: "intermediate",
    order: 2,
  },
  {
    id: "day2-codelab-1",
    moduleId: 2,
    type: "codelab",
    title: "Lab: Get Started with Antigravity CLI",
    description:
      "Configure and explore the Antigravity command-line interface — your primary tool for scripting agent workflows, managing MCP servers, and automating deployments.",
    externalUrl: "https://codelabs.developers.google.com/antigravity-cli-hands-on#0",
    estimatedMinutes: 60,
    difficulty: "intermediate",
    order: 3,
  },
  {
    id: "day2-codelab-2",
    moduleId: 2,
    type: "codelab",
    title: "Lab: Explore Google Developer Knowledge MCP Server",
    description:
      "Connect the Google Developer Knowledge MCP server to Antigravity, giving your agent live access to the latest Google APIs, SDKs, and release notes.",
    externalUrl: "https://codelabs.developers.google.com/developer-knowledge-mcp-antigravity",
    estimatedMinutes: 60,
    difficulty: "intermediate",
    order: 4,
  },

  // Day 3
  {
    id: "day3-podcast",
    moduleId: 3,
    type: "podcast",
    title: "Listen: Agent Skills",
    description:
      "How SKILL.md files solve context rot, enable progressive disclosure, and create portable institutional knowledge that travels with your codebase.",
    externalUrl: "https://www.youtube.com/watch?v=uYURYHhpmKc",
    estimatedMinutes: 45,
    difficulty: "beginner",
    order: 1,
  },
  {
    id: "day3-whitepaper",
    moduleId: 3,
    type: "whitepaper",
    title: "Read: Agent Skills",
    description:
      "The whitepaper on Agent Skills architecture — skill anatomy, progressive disclosure patterns, the skill lifecycle, and team-scale skill management.",
    externalUrl: "https://www.kaggle.com/whitepaper-agent-skills",
    estimatedMinutes: 50,
    difficulty: "intermediate",
    order: 2,
  },
  {
    id: "day3-codelab-1",
    moduleId: 3,
    type: "codelab",
    title: "Lab: Explore How Skills Work in Antigravity",
    description:
      "Create, load, and compose SKILL.md files inside the Antigravity IDE — observe how progressive skill disclosure shapes agent behavior and output quality.",
    externalUrl: "https://codelabs.developers.google.com/getting-started-with-antigravity-skills?hl=en#4",
    estimatedMinutes: 60,
    difficulty: "intermediate",
    order: 3,
  },
  {
    id: "day3-codelab-2",
    moduleId: 3,
    type: "codelab",
    title: "Lab: Build Agents with Antigravity and ADK",
    description:
      "Use the Agents CLI and the Agent Development Kit (ADK) to build a multi-step agent workflow — covering the plan/act/observe/reflect lifecycle end-to-end.",
    externalUrl: "https://codelabs.developers.google.com/agents-cli-adk-lifecycle",
    estimatedMinutes: 75,
    difficulty: "advanced",
    order: 4,
  },

  // Day 4
  {
    id: "day4-podcast",
    moduleId: 4,
    type: "podcast",
    title: "Listen: Vibe Coding Agent Security and Evaluation",
    description:
      "The 7-pillar Effective Trust architecture, slopsquatting defenses, the Red/Blue/Green security triad, and trajectory-based evaluation with OpenTelemetry.",
    externalUrl: "https://www.youtube.com/watch?v=Ddz1b8CYPvg",
    estimatedMinutes: 45,
    difficulty: "intermediate",
    order: 1,
  },
  {
    id: "day4-whitepaper",
    moduleId: 4,
    type: "whitepaper",
    title: "Read: Vibe Coding Agent Security and Evaluation",
    description:
      "Technical reference for the Effective Trust architecture, sandboxing strategies, prompt injection defenses, audit trail design, and OTel trajectory evaluation.",
    externalUrl: "https://www.kaggle.com/whitepaper-vibe-coding-agent-security-and-evaluation",
    estimatedMinutes: 60,
    difficulty: "advanced",
    order: 2,
  },
  {
    id: "day4-codelab-1",
    moduleId: 4,
    type: "codelab",
    title: "Lab: Expense-Approval Agent with Human-in-the-Loop Triage",
    description:
      "Build an autonomous expense-approval agent that handles routine approvals and escalates edge cases to a human reviewer — a practical human-in-the-loop pattern.",
    externalUrl: "https://codelabs.developers.google.com/vibecode-ambient-expense-agent",
    estimatedMinutes: 90,
    difficulty: "advanced",
    order: 3,
  },
  {
    id: "day4-codelab-2",
    moduleId: 4,
    type: "codelab",
    title: "Lab: Write Secure AI Code",
    description:
      "Apply threat scanning, safety guards, and automated security testing to AI-generated code — learn to find and fix slopsquatting, injection risks, and over-privileged credentials.",
    externalUrl: "https://codelabs.developers.google.com/secure-agentic-coding",
    estimatedMinutes: 90,
    difficulty: "advanced",
    order: 4,
  },

  // Day 5
  {
    id: "day5-capstone",
    moduleId: 5,
    type: "capstone",
    title: "Capstone: Build Your AI Agent",
    description:
      "Apply at least three course concepts to a real-world use case. Choose from four tracks: Agents for Good, Agents for Business, Concierge Agents, or Freestyle. Submit via the Kaggle competition page.",
    externalUrl: "https://www.kaggle.com/competitions/5-day-ai-agents-intensive-vibecoding-course-with-google/discussion/709721",
    estimatedMinutes: 180,
    difficulty: "advanced",
    order: 1,
  },
];

/** Return the steps for a given module id */
export function getStepsForModule(moduleId: number): StepData[] {
  return STEPS.filter((s) => s.moduleId === moduleId).sort((a, b) => a.order - b.order);
}

/** Return a module by id */
export function getModuleById(id: number): ModuleData | undefined {
  return MODULES.find((m) => m.id === id);
}
