"use client";

import { useTheme } from "next-themes";
import { AuthUserButton } from "@/components/auth";
import { Sun, Moon, Flame, Route } from "lucide-react";
import { cn } from "@/lib/utils";

interface SiteNavProps {
  streak?: number;
}

export function SiteNav({ streak = 0 }: SiteNavProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Route size={20} className="text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            AgentPath
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Streak badge */}
          {streak > 0 && (
            <div
              className={cn(
                "hidden sm:flex items-center gap-1 rounded-full px-2.5 py-1",
                "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
              )}
            >
              <Flame size={13} />
              <span className="text-xs font-semibold">{streak}</span>
            </div>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            title="Toggle theme"
            aria-label="Toggle dark mode"
          >
            <Sun size={16} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon size={16} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>

          {/* Clerk user button (only when Clerk is configured) */}
          <AuthUserButton />
        </div>
      </div>
    </nav>
  );
}
