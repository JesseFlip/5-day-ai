"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { TutorModel } from "@/app/api/tutor/route";

export type { TutorModel };

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function useTutorChat(moduleId: number, model: TutorModel = "claude") {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setHistoryLoaded(false);
    setMessages([]);
    setError(null);

    fetch(`/api/tutor/${moduleId}/history`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: { messages: Array<{ role: string; content: string }> }) => {
        setMessages(data.messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));
      })
      .catch(() => {})
      .finally(() => setHistoryLoaded(true));
  }, [moduleId]);

  const sendMessage = useCallback(
    async (messageText: string) => {
      const trimmed = messageText.trim();
      if (!trimmed || isLoading) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      setInput("");
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moduleId, message: trimmed, model }),
          signal: controller.signal,
        });

        if (!response.ok) {
          let errMsg = "Something went wrong. Please try again.";
          try {
            const data = await response.json();
            if (response.status === 429 && data.retryAfter) {
              const minutes = Math.ceil(data.retryAfter / 60);
              errMsg = `You've asked a lot of questions! Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
            } else if (data.error) {
              errMsg = data.error;
            }
          } catch { /* ignore */ }
          setError(errMsg);
          setMessages((prev) => prev.slice(0, -1));
          return;
        }

        if (!response.body) { setError("No response body received."); return; }

        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantText = "";

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantText += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: assistantText };
            return updated;
          });
        }
        const remaining = decoder.decode();
        if (remaining) {
          assistantText += remaining;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: assistantText };
            return updated;
          });
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Connection error. Please check your network and try again.");
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
      }
    },
    [moduleId, model, isLoading]
  );

  const clearHistory = useCallback(async () => {
    try {
      await fetch(`/api/tutor/${moduleId}/history`, { method: "DELETE" });
      setMessages([]);
      setError(null);
    } catch {
      setError("Failed to clear conversation.");
    }
  }, [moduleId]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); },
    [input, sendMessage]
  );

  return { messages, isLoading, error, input, setInput, sendMessage, handleSubmit, clearHistory, historyLoaded };
}
