"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Lock } from "lucide-react";
import { StepRow } from "@/components/roadmap/step-row";
import { cn } from "@/lib/utils";
import type { ModuleData, StepData } from "@/lib/types";

interface ModuleCardProps {
  module: ModuleData;
  steps: StepData[];
  completedStepIds: string[];
  isUnlocked: boolean;
  nextStepId: string | null;
  onStepComplete: (stepId: string) => void;
  defaultOpen?: boolean;
}

export function ModuleCard({
  module,
  steps,
  completedStepIds,
  isUnlocked,
  nextStepId,
  onStepComplete,
  defaultOpen = false,
}: ModuleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const completedCount = steps.filter((s) => completedStepIds.includes(s.id)).length;
  const totalCount = steps.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isFullyComplete = completedCount === totalCount && totalCount > 0;

  return (
    <div
      className={cn(
        "rounded-xl border transition-shadow",
        isUnlocked
          ? "border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md"
          : "border-slate-200/60 dark:border-slate-800 opacity-60"
      )}
    >
      {/* Header */}
      <button
        onClick={() => isUnlocked && setIsOpen((o) => !o)}
        disabled={!isUnlocked}
        className={cn(
          "w-full flex items-center gap-4 px-5 py-4 text-left",
          isUnlocked
            ? "cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-xl"
            : "cursor-not-allowed rounded-xl"
        )}
        aria-expanded={isOpen}
      >
        {/* Day badge */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
            isFullyComplete
              ? "bg-emerald-500 text-white"
              : isUnlocked
              ? "bg-blue-600 text-white"
              : "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
          )}
        >
          {isUnlocked ? module.order : <Lock size={16} />}
        </div>

        {/* Title and progress */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug truncate">
              {module.title}
            </h2>
            {isFullyComplete && (
              <span className="text-xs font-medium rounded-full px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                Complete
              </span>
            )}
          </div>
          {isUnlocked ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 dark:bg-blue-400 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                {completedCount}/{totalCount}
              </span>
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Complete Day {module.order - 1} to unlock
            </p>
          )}
        </div>

        {/* Chevron */}
        {isUnlocked && (
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 text-slate-400 dark:text-slate-500"
          >
            <ChevronDown size={18} />
          </motion.div>
        )}
      </button>

      {/* Expanded body */}
      <AnimatePresence initial={false}>
        {isOpen && isUnlocked && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              {/* Focus summary */}
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 whitespace-pre-line">
                {module.focusSummary.split("\n")[0]}
              </p>

              {/* Steps */}
              <div className="flex flex-col gap-2">
                {steps.map((step) => (
                  <StepRow
                    key={step.id}
                    step={step}
                    isCompleted={completedStepIds.includes(step.id)}
                    isActive={step.id === nextStepId}
                    onComplete={onStepComplete}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
