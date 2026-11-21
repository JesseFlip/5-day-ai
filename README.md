# AgentPath

A self-paced, interactive learning roadmap that turns the Kaggle "5-Day AI Agents: Intensive Vibe Coding Course With Google" into an always-on platform any learner anywhere can work through at their own pace.

---

## A note on how this was built

**This project was built entirely by Claude (Anthropic's AI) using a personal Claude Code setup called Lumbergh.**

I am not a developer. I used Claude to plan, design, and write every line of code in this repository. I humbly request that **this project not be considered for the Kaggle competition** — it would not be fair to the talented developers and teams who built their submissions themselves, and that was never my intention.

My hope is simply that this is useful to someone. If this platform helps even one person get started with AI agents who might otherwise have been excluded — whether because of the language barrier, the time zone, the connection speed, or just the anxiety of not knowing where to begin — then it was worth making.

If you'd like to improve it, add a language, fix something that's broken, or take it in a different direction entirely: **please do**. Open a PR, fork it, reach out. I'm happy to work on it with anyone who's interested.

Good luck to everyone in the competition. What you've all built is genuinely impressive. Thank you for running a course that opened this world up to people like me.

---

## What it is

AgentPath preserves the structure of the 5-Day course — *concept summary → whitepaper deep-dive → hands-on codelab → capstone* — but removes the time and language barriers. The platform itself is also built *with* the concepts it teaches:

- An **AI Tutor Agent** (Google ADK + Claude + SKILL.md) that answers questions per module, demonstrating Day 3 Agent Skills concepts
- A **curriculum MCP server** that exposes course content via the Model Context Protocol, demonstrating Day 2 interoperability
- A **progressive hint system** that releases help in tiers rather than giving answers, demonstrating the Day 1 philosophy of learning by building
- Rate-limited, sandboxed AI endpoints reflecting Day 4 security principles

---

## Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- **Auth:** Clerk (optional — falls back to anonymous per-browser IDs)
- **Database:** PostgreSQL via Neon + Drizzle ORM
- **AI:** Vercel AI SDK + Claude claude-sonnet-4-6 + Google ADK
- **Agents:** MCP server (`@modelcontextprotocol/sdk`), Vercel AI SDK multi-agent
- **Hosting:** Vercel
- **Rate limiting:** Upstash Redis

---

## Getting started

```bash
# Install dependencies
pnpm install

# Copy env example and fill in your keys
cp .env.example .env.local

# Push the database schema
pnpm db:push

# Start the dev server
pnpm dev
```

See `.env.example` for all required environment variables.

---

## Deploying to Vercel

1. Import the repo at [vercel.com/new](https://vercel.com/new). The framework (Next.js) and pnpm are detected automatically.
2. Add a Postgres database — e.g. **Neon** from the Vercel Marketplace (Storage tab). It sets `DATABASE_URL` for you; make sure it's the **pooled** connection string.
3. Optionally add **Upstash Redis** from the Marketplace for rate limiting (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`).
4. Under **Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` (optional — without them there are no accounts; each browser gets an anonymous ID cookie and progress is saved per browser)
   - `ANTHROPIC_API_KEY` and/or `GOOGLE_GENERATIVE_AI_API_KEY`
   - `MCP_API_KEY` (any random string)
   - `DEMO_MODE=true` if you want a no-database showcase deployment
5. Push the schema once from your machine: `vercel env pull .env.local && pnpm dotenv -e .env.local -- pnpm db:push`
6. Deploy. Module pages are pre-rendered at build time and served from the CDN; the AI tutor streams from a serverless function with a 60s limit.

Tip: put the Vercel function region (Settings → Functions) next to your database region to minimise query latency.

---

## Course content

All course content (whitepapers, podcasts, codelabs) is the work of the Google and Kaggle teams behind the 5-Day AI Agents course. AgentPath links to their original materials and does not reproduce them. Full credit to:

- The Kaggle team
- Google DeepMind and the course instructors
- The Kaggle community Discord for support throughout the course

---

## Contributing

This project is open to anyone. If you want to:
- Add a translation
- Improve the AI Tutor's SKILL.md
- Build the in-browser sandbox (the hardest missing piece)
- Add community Q&A
- Fix anything that's broken

Open an issue or a PR. You don't need to ask permission.

---

*Built with [Claude Code](https://claude.ai/code) via a personal setup called Lumbergh. Every line of code was written by Claude. I directed it, reviewed it, and am responsible for it — but I didn't write it.*
