"use client";

import * as React from "react";
import { IconSparkles } from "./icons";
import styles from "./CopilotCard.module.css";

export type CopilotCardProps = {
  suggestions: string[];
};

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatListDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "";
  }
}

export function CopilotCard({ suggestions }: CopilotCardProps) {
  const [value, setValue] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = React.useState<string | null>(null);

  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [convList, setConvList] = React.useState<
    { id: string; title: string | null; updatedAt: string }[]
  >([]);
  const [convListLoading, setConvListLoading] = React.useState(false);
  const [convListError, setConvListError] = React.useState<string | null>(null);
  const [openingConvId, setOpeningConvId] = React.useState<string | null>(null);

  const canSubmit = value.trim().length > 0 && !loading;
  const showSuggestions = messages.length === 0;

  React.useEffect(() => {
    if (!historyOpen) return;
    let cancelled = false;
    void (async () => {
      setConvListLoading(true);
      setConvListError(null);
      try {
        const res = await fetch("/api/ia/conversations");
        const data = (await res.json()) as {
          conversations?: { id: string; title: string | null; updatedAt: string }[];
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Error al cargar");
        if (!cancelled) setConvList(data.conversations ?? []);
      } catch {
        if (!cancelled) {
          setConvListError("No se pudo cargar el historial.");
          setConvList([]);
        }
      } finally {
        if (!cancelled) setConvListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [historyOpen]);

  function startNewChat() {
    setConversationId(null);
    setMessages([]);
    setHistoryOpen(false);
    setConvListError(null);
  }

  async function loadConversation(convId: string) {
    setOpeningConvId(convId);
    setConvListError(null);
    try {
      const res = await fetch(`/api/ia/conversations/${encodeURIComponent(convId)}`);
      const data = (await res.json()) as {
        messages?: { id: string; role: ChatRole; content: string }[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Error");
      const mapped: ChatMessage[] = (data.messages ?? []).map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
      }));
      setMessages(mapped);
      setConversationId(convId);
      setHistoryOpen(false);
    } catch {
      setConvListError("No se pudieron cargar los mensajes.");
    } finally {
      setOpeningConvId(null);
    }
  }

  async function submit() {
    const message = value.trim();
    if (!message || loading) return;

    const userMsg: ChatMessage = { id: newId(), role: "user", content: message };
    setMessages((prev) => [...prev, userMsg]);
    setValue("");
    setLoading(true);

    try {
      const res = await fetch("/api/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          ...(conversationId ? { conversationId } : {}),
        }),
      });

      const data = (await res.json()) as {
        answer?: string;
        conversationId?: string;
        error?: string;
      };

      if (res.status === 404) {
        setConversationId(null);
      } else if (typeof data.conversationId === "string" && data.conversationId.trim()) {
        setConversationId(data.conversationId.trim());
      }

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: "assistant",
            content: data.error ?? "No se pudo obtener una respuesta.",
          },
        ]);
        return;
      }

      if (typeof data.answer === "string") {
        setMessages((prev) => [
          ...prev,
          { id: newId(), role: "assistant", content: data.answer },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: newId(), role: "assistant", content: "Respuesta inválida del servidor." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: newId(), role: "assistant", content: "Error de red. Intentá de nuevo." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-[var(--radius-lg)] border border-white/10 bg-[color:var(--quipu-night)] text-white shadow-[0_18px_40px_rgba(7,27,74,0.22)]">
      <div className="shrink-0 px-6 pt-6">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 text-xl font-semibold tracking-tight">
              Chateá con tu copiloto financiero
            </div>
            <div className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/15">
              <IconSparkles className="size-4" />
              Copiloto Quipu
            </div>
          </div>
          <div className="mt-1 text-sm text-white/70">
            Hacé preguntas, recibí alertas, recomendaciones y ayuda para tomar decisiones.
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setHistoryOpen((o) => !o)}
              className={[
                "rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 ring-1 ring-white/10 hover:bg-white/15",
                historyOpen ? "ring-2 ring-[color:var(--quipu-accent)]/50" : "",
              ].join(" ")}
            >
              Historial
            </button>
            <button
              type="button"
              onClick={startNewChat}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 ring-1 ring-white/10 hover:bg-white/10"
            >
              Nuevo chat
            </button>
          </div>
          {historyOpen ? (
            <div className="mt-3 max-h-44 overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-2 ring-1 ring-white/10">
              {convListLoading ? (
                <p className="px-2 py-2 text-xs text-white/55">Cargando…</p>
              ) : null}
              {convListError ? (
                <p className="px-2 py-2 text-xs text-rose-200/90" role="alert">
                  {convListError}
                </p>
              ) : null}
              {!convListLoading && !convListError && convList.length === 0 ? (
                <p className="px-2 py-2 text-xs text-white/55">No hay conversaciones guardadas.</p>
              ) : null}
              <ul className="space-y-1">
                {convList.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => void loadConversation(c.id)}
                      disabled={openingConvId !== null || loading}
                      className="flex w-full flex-col rounded-lg px-2 py-2 text-left hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="truncate text-sm text-white/90">
                        {c.title?.trim() ? c.title.trim() : "Chat sin título"}
                      </span>
                      <span className="text-[11px] text-white/45">
                        {formatListDate(c.updatedAt)}
                        {openingConvId === c.id ? " · abriendo…" : ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className={`min-h-0 flex-1 overflow-y-auto px-6 pb-2 pt-3 ${styles.chatScroll}`}>
          <div className="flex flex-col gap-3">
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[min(100%,28rem)] rounded-2xl border border-white/15 bg-[color:var(--quipu-accent)]/35 px-4 py-2.5 text-sm leading-6 text-white ring-1 ring-white/10">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex justify-start">
                  <div
                    className="max-w-[min(100%,28rem)] whitespace-pre-wrap rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm leading-6 text-white/90 ring-1 ring-white/10"
                    role="status"
                  >
                    {m.content}
                  </div>
                </div>
              )
            )}
            {loading ? (
              <div className="flex justify-start" aria-live="polite">
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white/70 ring-1 ring-white/10">
                  Consultando…
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 border-t border-white/10 px-6 pb-6 pt-4">
          {showSuggestions ? (
            <div className="flex flex-wrap gap-2">
              {suggestions
                .filter((q) => q !== "Proyectá mi saldo a 30 días.")
                .slice(0, 4)
                .map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setValue(q)}
                    className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/85 ring-1 ring-white/10 hover:bg-white/15"
                  >
                    {q}
                  </button>
                ))}
            </div>
          ) : null}

          <div className={showSuggestions ? "mt-5" : ""}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    void submit();
                  }}
                  placeholder="Escribí tu consulta…"
                  disabled={loading}
                  className="h-11 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white placeholder:text-white/55 outline-none focus:ring-4 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
              <button
                type="button"
                onClick={() => void submit()}
                disabled={!canSubmit}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[color:var(--quipu-accent)] px-5 text-sm font-medium text-white hover:opacity-95 active:translate-y-px disabled:pointer-events-none disabled:opacity-45"
              >
                <IconSparkles className="size-4" />
                {loading ? "Consultando…" : "Consultar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
