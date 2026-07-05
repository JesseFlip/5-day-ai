import { Headphones, BookOpen, Code2, Trophy } from "lucide-react";
import type { StepData } from "@/lib/types";

interface StepIconProps {
  type: StepData["type"];
  className?: string;
}

export function StepIcon({ type, className }: StepIconProps) {
  const props = { size: 18, className };

  switch (type) {
    case "podcast":
      return <Headphones {...props} />;
    case "whitepaper":
      return <BookOpen {...props} />;
    case "codelab":
      return <Code2 {...props} />;
    case "capstone":
      return <Trophy {...props} />;
  }
}
