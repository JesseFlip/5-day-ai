"use client";

import Link from "next/link";

export function DemoBanner() {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-center text-xs text-amber-700 dark:text-amber-400">
      Running in <strong>demo mode</strong> — progress resets on server restart, AI Tutor uses canned responses.{" "}
      <Link href="/setup" className="underline font-medium hover:text-amber-900 dark:hover:text-amber-200">
        Visit /setup to configure real services →
      </Link>
    </div>
  );
}
