"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type RevealedHint = {
  tier: number;
  content: string;
};

type HintState = {
  revealed: RevealedHint[];
  nextTier: number | null; // null means all tiers have been revealed
  maxTier: number;
};

type RevealResponse = {
  content: string;
  tier: number;
  error?: string;
  needsConfirmation?: boolean;
};

async function fetchHintState(stepId: string): Promise<HintState> {
  const res = await fetch(`/api/hints/${encodeURIComponent(stepId)}`);
  if (!res.ok) throw new Error("Failed to load hint state");
  return res.json() as Promise<HintState>;
}

async function revealHint(
  stepId: string,
  tier: number,
  confirmed?: boolean
): Promise<RevealResponse> {
  const res = await fetch(`/api/hints/${encodeURIComponent(stepId)}/reveal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tier, confirmed }),
  });
  if (!res.ok) {
    const data = (await res.json()) as RevealResponse;
    throw Object.assign(new Error(data.error ?? "Failed to reveal hint"), {
      needsConfirmation: data.needsConfirmation,
    });
  }
  return res.json() as Promise<RevealResponse>;
}

const TIER_LABELS: Record<number, string> = {
  1: "Concept reminder",
  2: "Approach suggestion",
  3: "Pseudocode skeleton",
  4: "Near-complete solution",
};

function tierBadgeColor(tier: number): string {
  switch (tier) {
    case 1:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
    case 2:
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    case 3:
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300";
    case 4:
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    default:
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  }
}

function getButtonLabel(nextTier: number | null, maxTier: number): string {
  if (nextTier === null) return "";
  if (nextTier === 1) return "Get hint";
  if (nextTier === maxTier) return "Show answer";
  // Non-final hint tiers: show progress excluding the final answer tier
  const nonAnswerTiers = maxTier - 1;
  return `Next hint (${nextTier - 1}/${nonAnswerTiers})`;
}

type ConfirmDialogProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
};

function ConfirmDialog({ open, onConfirm, onCancel, isLoading }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="relative w-full max-w-sm rounded-xl bg-white dark:bg-zinc-900 shadow-xl p-6 mx-4">
        <h2
          id="confirm-dialog-title"
          className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2"
        >
          Reveal the full solution?
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          This shows a near-complete solution. Try working through the earlier hints first — you
          will learn more that way. Reveal it anyway?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
          >
            Keep trying
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Revealing…" : "Yes, show it"}
          </button>
        </div>
      </div>
    </div>
  );
}

type HintButtonProps = {
  stepId: string;
};

export function HintButton({ stepId }: HintButtonProps) {
  const queryClient = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    data,
    isLoading,
    isError,
  } = useQuery<HintState>({
    queryKey: ["hints", stepId],
    queryFn: () => fetchHintState(stepId),
    staleTime: 0,
  });

  const mutation = useMutation<
    RevealResponse,
    Error & { needsConfirmation?: boolean },
    { tier: number; confirmed?: boolean }
  >({
    mutationFn: ({ tier, confirmed }) => revealHint(stepId, tier, confirmed),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["hints", stepId] });
      setShowConfirm(false);
    },
    onError: (error) => {
      if (error.needsConfirmation) {
        setShowConfirm(true);
      }
    },
  });

  const handleReveal = () => {
    if (!data || data.nextTier === null) return;
    const tier = data.nextTier;
    if (tier === 4) {
      // Trigger the server check to confirm needsConfirmation, then show dialog
      setShowConfirm(true);
    } else {
      mutation.mutate({ tier });
    }
  };

  const handleConfirm = () => {
    if (!data || data.nextTier === null) return;
    mutation.mutate({ tier: data.nextTier, confirmed: true });
  };

  if (isLoading) {
    return (
      <div className="mt-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4">
        <div className="h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
    );
  }

  if (isError || !data) {
    return null;
  }

  const { revealed, nextTier, maxTier } = data;
  const buttonLabel = getButtonLabel(nextTier, maxTier);
  const allRevealed = nextTier === null;

  return (
    <>
      <ConfirmDialog
        open={showConfirm}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
        isLoading={mutation.isPending}
      />

      <div className="mt-6 space-y-4">
        {/* Already-revealed hints, stacked tier 1 → 4 */}
        {revealed.length > 0 && (
          <div className="space-y-3">
            {[...revealed]
              .sort((a, b) => a.tier - b.tier)
              .map((hint) => (
                <div
                  key={hint.tier}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tierBadgeColor(hint.tier)}`}
                    >
                      Hint {hint.tier}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {TIER_LABELS[hint.tier]}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {hint.content}
                  </p>
                </div>
              ))}
          </div>
        )}

        {/* Reveal button or completion message */}
        {allRevealed ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
            All hints revealed. Now try applying what you learned.
          </p>
        ) : (
          <button
            type="button"
            onClick={handleReveal}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
            aria-label={buttonLabel}
          >
            {mutation.isPending ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                Loading…
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 text-zinc-400"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                    clipRule="evenodd"
                  />
                </svg>
                {buttonLabel}
              </>
            )}
          </button>
        )}

        {mutation.isError && !mutation.error.needsConfirmation && (
          <p className="text-xs text-red-600 dark:text-red-400" role="alert">
            {mutation.error.message ?? "Something went wrong. Please try again."}
          </p>
        )}
      </div>
    </>
  );
}
