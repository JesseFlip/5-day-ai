export type ModuleData = {
  id: number;
  slug: string;
  title: string;
  focusSummary: string;
  podcastUrl: string;
  whitepaperUrl: string;
  order: number;
};

export type StepData = {
  id: string;
  moduleId: number;
  type: "podcast" | "whitepaper" | "codelab" | "capstone";
  title: string;
  description: string;
  externalUrl: string | null;
  estimatedMinutes: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  order: number;
};

export type ProgressData = {
  completedStepIds: string[];
  streak: number;
  nextStepId: string | null;
};
