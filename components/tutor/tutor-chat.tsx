"use client";

import { useEffect, useRef } from "react";
import { useTutorChat, type ChatMessage, type TutorModel } from "./use-tutor-chat";

interface TutorChatProps {
  moduleId: number;
  moduleTitle?: string;
  model: TutorModel;
  onModelChange: (m: TutorModel) => void;
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 px-4 py-2">
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-zinc-100 px-4 py-3 dark:bg-zinc-800">
        {[0, 150, 300].map((delay) => (
          <span key={delay} className="inline-block h-2 w-2 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-500" style={{ animationDelay: `${delay}ms` }} />
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} px-4 py-1`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${isUser ? "rounded-tr-sm bg-blue-600 text-white" : "rounded-tl-sm bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"}`}>
        {message.content || <span className="italic text-zinc-400 dark:text-zinc-500">Thinking…</span>}
      </div>
    </div>
  );
}

function ModelToggle({ model, onChange }: { model: TutorModel; onChange: (m: TutorModel) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-zinc-200 p-0.5 text-xs dark:border-zinc-700">
      {(["claude", "gemini"] as TutorModel[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`rounded-md px-2.5 py-1 font-medium capitalize transition-colors ${
            model === m
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          {m === "claude" ? "Claude" : "Gemini"}
        </button>
      ))}
    </div>
  );
}

export function TutorChat({ moduleId, moduleTitle, model, onModelChange }: TutorChatProps) {
  const { messages, isLoading, error, input, setInput, handleSubmit, clearHistory, historyLoaded } = useTutorChat(moduleId, model);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    if (historyLoaded) inputRef.current?.focus();
  }, [historyLoaded]);

  const isEmpty = messages.length === 0 && historyLoaded;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3 gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">AI Tutor</p>
          {moduleTitle && <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{moduleTitle}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ModelToggle model={model} onChange={onModelChange} />
          {messages.length > 0 && (
            <button onClick={clearHistory} className="rounded-md px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4">
        {!historyLoaded && <div className="flex items-center justify-center py-8 text-sm text-zinc-400">Loading…</div>}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Ask me anything about this module</p>
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Using {model === "claude" ? "Claude (Anthropic)" : "Gemini (Google)"}</p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
        {isLoading && (messages.length === 0 || messages[messages.length - 1]?.role === "user") && <TypingIndicator />}
      </div>

      {error && (
        <div className="mx-4 mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="border-t px-4 py-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question…"
            disabled={isLoading || !historyLoaded}
            maxLength={2000}
            className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:bg-zinc-900 dark:focus:ring-blue-900/30"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !historyLoaded}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
        <p className="mt-1.5 text-center text-xs text-zinc-400 dark:text-zinc-600">Tutor guides — doesn&apos;t solve. 20 questions/hour.</p>
      </div>
    </div>
  );
}
