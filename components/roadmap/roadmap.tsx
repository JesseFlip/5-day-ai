"use client";

import { Flame } from "lucide-react";
import { ModuleCard } from "@/components/roadmap/module-card";
import { MODULES, getStepsForModule } from "@/lib/content/curriculum";
import type { ProgressData } from "@/lib/types";

interface RoadmapProps {
  progress: ProgressData;
  onStepComplete: (stepId: string) => void;
}

function isModuleUnlocked(moduleOrder: number, completedStepIds: string[]): boolean {
  // Day 1 is always unlocked
  if (moduleOrder === 1) return true;

  // The previous module must be 100% complete
  const prevModule = MODULES.find((m) => m.order === moduleOrder - 1);
  if (!prevModule) return true;

  const prevSteps = getStepsForModule(prevModule.id);
  if (prevSteps.length === 0) return true;

  return prevSteps.every((s) => completedStepIds.includes(s.id));
}

export function Roadmap({ progress, onStepComplete }: RoadmapProps) {
  const { completedStepIds, streak, nextStepId } = progress;

  // Determine which module the next step belongs to (for default-open)
  const nextStep = MODULES.flatMap((m) => getStepsForModule(m.id)).find(
    (s) => s.id === nextStepId
  );
  const activeModuleId = nextStep?.moduleId ?? (completedStepIds.length === 0 ? 1 : null);

  return (
    <section className="w-full max-w-2xl mx-auto px-4 py-6">
      {/* Streak badge */}
      {streak > 0 && (
        <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <Flame size={18} className="text-amber-500" />
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
            {streak}-day streak — keep it going!
          </span>
        </div>
      )}

      {/* Module cards */}
      <div className="flex flex-col gap-3">
        {MODULES.map((mod) => {
          const steps = getStepsForModule(mod.id);
          const unlocked = isModuleUnlocked(mod.order, completedStepIds);
          const defaultOpen = mod.id === activeModuleId;

          return (
            <ModuleCard
              key={mod.id}
              module={mod}
              steps={steps}
              completedStepIds={completedStepIds}
              isUnlocked={unlocked}
              nextStepId={nextStepId}
              onStepComplete={onStepComplete}
              defaultOpen={defaultOpen}
            />
          );
        })}
      </div>
    </section>
  );
}
