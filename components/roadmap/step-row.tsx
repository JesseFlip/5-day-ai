"use client";

import { ExternalLink, CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StepIcon } from "@/components/roadmap/step-icon";
import { cn } from "@/lib/utils";
import type { StepData } from "@/lib/types";

interface StepRowProps {
  step: StepData;
  isCompleted: boolean;
  isActive: boolean;
  onComplete: (stepId: string) => void;
}

const difficultyVariant = {
  beginner: "success",
  intermediate: "warning",
  advanced: "advanced",
} as const;

const typeColorClass = {
  podcast: "text-purple-500 dark:text-purple-400",
  whitepaper: "text-blue-500 dark:text-blue-400",
  codelab: "text-emerald-500 dark:text-emerald-400",
  capstone: "text-amber-500 dark:text-amber-400",
} as const;

function formatMinutes(mins: number) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function StepRow({ step, isCompleted, isActive, onComplete }: StepRowProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 transition-colors",
        isCompleted
          ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20 opacity-75"
          : isActive
          ? "border-blue-300 bg-blue-50/60 dark:border-blue-700/50 dark:bg-blue-950/30 ring-1 ring-blue-300 dark:ring-blue-700"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600"
      )}
    >
      {/* Step type icon */}
      <div
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isCompleted
            ? "bg-emerald-100 dark:bg-emerald-900/40"
            : "bg-slate-100 dark:bg-slate-700"
        )}
      >
        <StepIcon
          type={step.type}
          className={isCompleted ? "text-emerald-600 dark:text-emerald-400" : typeColorClass[step.type]}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span
            className={cn(
              "text-sm font-semibold leading-snug",
              isCompleted ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-slate-100"
            )}
          >
            {step.title}
          </span>
          {isActive && (
            <span className="text-xs font-medium rounded-full px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              Up next
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
          {step.description}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={difficultyVariant[step.difficulty]}>
            {step.difficulty}
          </Badge>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {formatMinutes(step.estimatedMinutes)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        {step.externalUrl && (
          <a
            href={step.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
            title="Open resource"
          >
            <ExternalLink size={15} />
          </a>
        )}
        <button
          onClick={() => onComplete(step.id)}
          disabled={isCompleted}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
            isCompleted
              ? "text-emerald-500 dark:text-emerald-400 cursor-default"
              : "text-slate-300 hover:text-emerald-500 dark:text-slate-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          )}
          title={isCompleted ? "Completed" : "Mark complete"}
        >
          {isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        </button>
      </div>
    </div>
  );
}
