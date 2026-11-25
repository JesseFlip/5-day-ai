import { TutorSidebar } from "@/components/tutor/tutor-sidebar";
import { TutorDrawer } from "@/components/tutor/tutor-drawer";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MODULES, getModuleById, getStepsForModule } from "@/lib/content/curriculum";

// Curriculum is static, so every module page is pre-rendered at build time
// and served from Vercel's CDN. Reading the data directly (instead of fetching
// our own /api route over HTTP) avoids an extra function hop and breaks no
// matter whether Deployment Protection is enabled on preview URLs.
export const dynamicParams = false;

export function generateStaticParams() {
  return MODULES.map((m) => ({ id: String(m.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const mod = getModuleById(Number(id));
  return mod ? { title: `${mod.title} | AgentPath` } : {};
}

const STEP_TYPE_LABELS: Record<string, string> = {
  podcast: "Podcast",
  whitepaper: "Whitepaper",
  codelab: "Codelab",
  capstone: "Capstone",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default async function ModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const moduleData = getModuleById(Number(id));
  if (!moduleData) notFound();
  const steps = getStepsForModule(moduleData.id);

  return (
    <>
      {/* Main content — padded right on desktop to make room for the sidebar */}
      <div className="min-h-screen lg:pr-80">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-zinc-400">
            <Link href="/" className="transition-colors hover:text-zinc-600 dark:hover:text-zinc-300">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-zinc-600 dark:text-zinc-300">Day {moduleData.id}</span>
          </nav>

          {/* Module header */}
          <header className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Day {moduleData.id}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {moduleData.title}
            </h1>
            <p className="mt-3 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              {moduleData.focusSummary}
            </p>

            {/* Resource links */}
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={moduleData.podcastUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
              >
                <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                Watch Podcast
              </a>
              <a
                href={moduleData.whitepaperUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
              >
                <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Read Whitepaper
              </a>
            </div>
          </header>

          {/* Steps list */}
          {steps.length > 0 ? (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                Course Steps
              </h2>
              <ol className="space-y-3">
                {steps.map((step, index) => (
                  <li key={step.id}>
                    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                            {index + 1}
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                                {step.title}
                              </h3>
                              <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                                {STEP_TYPE_LABELS[step.type] ?? step.type}
                              </span>
                              <span
                                className={`rounded-md px-1.5 py-0.5 text-xs ${
                                  DIFFICULTY_COLORS[step.difficulty] ??
                                  "bg-zinc-100 text-zinc-500"
                                }`}
                              >
                                {step.difficulty}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                              {step.description}
                            </p>
                            <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                              ~{step.estimatedMinutes} min
                            </p>
                          </div>
                        </div>
                        {step.externalUrl && (
                          <a
                            href={step.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                          >
                            Open
                          </a>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
              <p className="text-sm text-zinc-400">
                Course steps will appear here once they are published.
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                In the meantime, ask the AI Tutor questions about Day {moduleData.id}!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop sidebar */}
      <TutorSidebar moduleId={moduleData.id} moduleTitle={moduleData.title} />

      {/* Mobile bottom sheet */}
      <TutorDrawer moduleId={moduleData.id} moduleTitle={moduleData.title} />
    </>
  );
}
