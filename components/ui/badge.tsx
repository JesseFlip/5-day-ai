import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "outline" | "success" | "warning" | "advanced";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  secondary: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  outline: "border border-current bg-transparent",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
