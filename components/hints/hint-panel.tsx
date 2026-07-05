import { HintButton } from "./hint-button";

type StepType = "podcast" | "whitepaper" | "codelab" | "capstone";

type HintPanelProps = {
  stepId: string;
  stepType: StepType;
};

/**
 * HintPanel renders the progressive hint UI for codelab steps only.
 * For podcast, whitepaper, and capstone steps it renders nothing —
 * hints are only meaningful for hands-on coding exercises.
 */
export function HintPanel({ stepId, stepType }: HintPanelProps) {
  if (stepType !== "codelab") return null;
  return <HintButton stepId={stepId} />;
}
