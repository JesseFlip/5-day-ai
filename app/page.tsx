"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthSignInButton, useAuthState } from "@/components/auth";
import { ArrowRight, BookOpen } from "lucide-react";
import { SiteNav } from "@/components/nav/site-nav";
import { Roadmap } from "@/components/roadmap/roadmap";
import { AttributionFooter } from "@/components/attribution-footer";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProgressData } from "@/lib/types";

// ─── API fetch helpers ────────────────────────────────────────────────────────

async function fetchProgress(): Promise<ProgressData> {
  const res = await fetch("/api/progress");
  if (!res.ok) throw new Error("Failed to load progress");
  return res.json();
}

async function markStepComplete(stepId: string): Promise<{ ok: boolean; nextStepId: string | null }> {
  const res = await fetch("/api/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stepId }),
  });
  if (!res.ok) throw new Error("Failed to update progress");
  return res.json();
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function RoadmapSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 flex flex-col gap-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-2 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Sign-in prompt ───────────────────────────────────────────────────────────

function SignInPrompt() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/40">
        <BookOpen size={28} className="text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Sign in to track your progress
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
          AgentPath saves your progress, tracks your streak, and knows exactly where you left off.
        </p>
      </div>
      <AuthSignInButton>
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
          Sign in to get started
          <ArrowRight size={15} />
        </button>
      </AuthSignInButton>
    </div>
  );
}

// ─── Welcome / Resume banner ──────────────────────────────────────────────────

function WelcomeBanner({ progress }: { progress: ProgressData }) {
  const hasStarted = progress.completedStepIds.length > 0;

  if (!hasStarted) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 pb-2">
        <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
            Welcome to AgentPath
          </h2>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            You are at the start of the 5-Day AI Agents course. Expand Day 1 below to begin.
          </p>
        </div>
      </div>
    );
  }

  const done = progress.completedStepIds.length;
  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-2">
      <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-5 py-3 gap-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-slate-100">{done} step{done !== 1 ? "s" : ""}</span> completed
        </p>
        {progress.nextStepId && (
          <a
            href="#roadmap"
            className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700 transition-colors"
          >
            Resume <ArrowRight size={12} />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { isLoaded: clerkLoaded, isSignedIn } = useAuthState();
  const queryClient = useQueryClient();

  const {
    data: progress,
    isLoading: progressLoading,
  } = useQuery<ProgressData>({
    queryKey: ["progress"],
    queryFn: fetchProgress,
    // Always fetch — the API returns empty progress for unauthenticated users
    staleTime: 10_000,
  });

  const completeMutation = useMutation({
    mutationFn: markStepComplete,
    onMutate: async (stepId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["progress"] });
      const prev = queryClient.getQueryData<ProgressData>(["progress"]);
      if (prev) {
        queryClient.setQueryData<ProgressData>(["progress"], {
          ...prev,
          completedStepIds: prev.completedStepIds.includes(stepId)
            ? prev.completedStepIds
            : [...prev.completedStepIds, stepId],
        });
      }
      return { prev };
    },
    onError: (_err, _stepId, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["progress"], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
  });

  const handleStepComplete = (stepId: string) => {
    if (!isSignedIn) return;
    completeMutation.mutate(stepId);
  };

  // Effective progress — show empty shell when not signed in
  const effectiveProgress: ProgressData = progress ?? {
    completedStepIds: [],
    streak: 0,
    nextStepId: null,
  };

  const showLoading = !clerkLoaded || progressLoading;

  return (
    <div className="flex flex-col min-h-screen">
      <SiteNav streak={effectiveProgress.streak} />

      <main className="flex flex-col flex-1">
        {/* Hero */}
        <div className="w-full max-w-2xl mx-auto px-4 pt-8 pb-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1 tracking-tight">
            5-Day AI Agents Course
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            An interactive roadmap through Kaggle &amp; Google&apos;s AI Agents intensive. Complete each step at your own pace.
          </p>
        </div>

        {/* Sign-in prompt or roadmap */}
        {clerkLoaded && !isSignedIn ? (
          <SignInPrompt />
        ) : showLoading ? (
          <RoadmapSkeleton />
        ) : (
          <>
            <WelcomeBanner progress={effectiveProgress} />
            <div id="roadmap">
              <Roadmap
                progress={effectiveProgress}
                onStepComplete={handleStepComplete}
              />
            </div>
          </>
        )}
      </main>

      <AttributionFooter />
    </div>
  );
}
