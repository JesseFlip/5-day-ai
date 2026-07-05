"use client";

import { useState } from "react";
import { TutorChat } from "./tutor-chat";

interface TutorSidebarProps {
  moduleId: number;
  moduleTitle?: string;
}

export function TutorSidebar({ moduleId, moduleTitle }: TutorSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Toggle button — visible only when sidebar is collapsed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-1.5 rounded-l-xl border border-r-0 bg-white px-2 py-4 shadow-md transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 lg:flex"
          aria-label="Open AI Tutor"
        >
          <svg
            className="h-5 w-5 text-blue-600 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
            />
          </svg>
          <span
            className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
            style={{ writingMode: "vertical-rl" }}
          >
            AI Tutor
          </span>
        </button>
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed right-0 top-0 z-30 hidden h-full w-80 flex-col border-l bg-white shadow-lg transition-transform dark:border-zinc-800 dark:bg-zinc-950 lg:flex ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Collapse button inside sidebar */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute -left-8 top-1/2 -translate-y-1/2 rounded-l-lg border border-r-0 bg-white p-1.5 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          aria-label="Close AI Tutor"
        >
          <svg
            className="h-4 w-4 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <TutorChat moduleId={moduleId} moduleTitle={moduleTitle} />
      </aside>
    </>
  );
}
