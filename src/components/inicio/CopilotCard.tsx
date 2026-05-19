"use client";

import * as React from "react";
import { IconSparkles, IconX } from "./icons";
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

type ConversationListItem = {
  id: string;
  title: string | null;
  createdAt?: string;
  updatedAt: string;
};

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseIsoDate(iso: string | undefined | null): Date | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

function formatConversationDateTitle(iso: string): string {
  const d = parseIsoDate(iso);
  if (!d) return "";
  const datePart = d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
  return `Conversación del ${datePart}`;
}

function formatLastActivity(iso: string): string {
  const d = parseIsoDate(iso);
  if (!d) return "";
  const timePart = d.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `Última actividad: ${timePart}`;
}

function displayConversationTitle(
  title: string | null | undefined,
  createdAt: string | undefined,
  updatedAt: string | undefined,
): string {
  const t = title?.trim();
  if (t && t.length > 0) return t;

  const titleIso = createdAt || updatedAt;
  if (titleIso) {
    const fromDate = formatConversationDateTitle(titleIso);
    if (fromDate) return fromDate;
  }

  return "Nueva conversación";
}

function displayLastActivity(
  updatedAt: string | undefined,
  createdAt: string | undefined,
): string {
  const activityIso = updatedAt || createdAt;
  if (!activityIso) return "";
  return formatLastActivity(activityIso);
}

export function CopilotCard({ suggestions }: CopilotCardProps) {
  const [value, setValue] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = React.useState<string | null>(null);

  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [convList, setConvList] = React.useState<ConversationListItem[]>([]);
  const [convListLoading, setConvListLoading] = React.useState(false);
  const [convListError, setConvListError] = React.useState<string | null>(null);
  const [openingConvId, setOpeningConvId] = React.useState<string | null>(null);
  const [deletingConvId, setDeletingConvId] = React.useState<string | null>(null);

  const canSubmit = value.trim().length > 0 && !loading;
  const showSuggestions = messages.length === 0;
  const historyBusy = openingConvId !== null || deletingConvId !== null;

  const fetchConversations = React.useCallback(async () => {
    setConvListLoading(true);
    setConvListError(null);
    try {
      const res = await fetch("/api/ia/conversations");
      const data = (await res.json()) as {
        conversations?: ConversationListItem[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Error al cargar");
      setConvList(data.conversations ?? []);
    } catch {
      setConvListError("No se pudo cargar el historial.");
      setConvList([]);
    } finally {
      setConvListLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!historyOpen) return;
    void fetchConversations();
  }, [historyOpen, fetchConversations]);

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

  async function deleteConversation(convId: string, event: React.MouseEvent) {
    event.stopPropagation();
    if (deletingConvId !== null || loading) return;
    if (!confirm("¿Eliminar esta conversación?")) return;

    setDeletingConvId(convId);
    setConvListError(null);
    try {
      const res = await fetch(`/api/ia/conversations/${encodeURIComponent(convId)}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Error al eliminar");
      }
      if (conversationId === convId) {
        setConversationId(null);
        setMessages([]);
      }
      await fetchConversations();
    } catch {
      setConvListError("No se pudo eliminar la conversación.");
    } finally {
      setDeletingConvId(null);
    }
  }

  function renderHistoryPanel(className = "") {
    return (
      <div
        className={[
          "flex w-full min-w-0 flex-col rounded-xl border border-white/15 bg-[color:var(--quipu-deep)]/95 p-4 shadow-xl ring-1 ring-white/10",
          className,
        ].join(" ")}
      >
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-white/50">
          Conversaciones guardadas
        </p>
        {convListLoading ? (
          <p className="px-1 py-2 text-xs text-white/55">Cargando…</p>
        ) : null}
        {convListError ? (
          <p className="px-1 py-2 text-xs text-rose-200/90" role="alert">
            {convListError}
          </p>
        ) : null}
        {!convListLoading && !convListError && convList.length === 0 ? (
          <p className="rounded-lg border border-dashed border-white/15 bg-white/5 px-3 py-5 text-center text-xs text-white/60">
            Todavía no tenés conversaciones guardadas.
          </p>
        ) : null}
        {!convListLoading && convList.length > 0 ? (
          <ul className="max-h-[min(60vh,24rem)] space-y-2 overflow-y-auto overflow-x-hidden pr-0.5">
            {convList.map((c) => {
              const isActive = conversationId === c.id;
              const isOpening = openingConvId === c.id;
              const isDeleting = deletingConvId === c.id;
              return (
                <li key={c.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (historyBusy || loading) return;
                      void loadConversation(c.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter" && e.key !== " ") return;
                      e.preventDefault();
                      if (historyBusy || loading) return;
                      void loadConversation(c.id);
                    }}
                    className={[
                      "group flex w-full min-w-0 cursor-pointer items-start gap-2 rounded-lg border px-3 py-2.5 text-left transition",
                      isActive
                        ? "border-[color:var(--quipu-accent)]/60 bg-white/15 ring-1 ring-[color:var(--quipu-accent)]/35"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
                      historyBusy || loading ? "pointer-events-none opacity-50" : "",
                    ].join(" ")}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-medium text-white/95 sm:text-sm">
                          {displayConversationTitle(c.title, c.createdAt, c.updatedAt)}
                        </span>
                        {isActive ? (
                          <span className="shrink-0 rounded-full bg-[color:var(--quipu-accent)]/30 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/90">
                            Activa
                          </span>
                        ) : null}
                      </div>
                      <span className="mt-0.5 block text-[10px] text-white/45">
                        {displayLastActivity(c.updatedAt, c.createdAt)}
                        {isOpening ? " · abriendo…" : ""}
                        {isDeleting ? " · eliminando…" : ""}
                      </span>
                    </div>
                    <button
                      type="button"
                      aria-label="Eliminar conversación"
                      disabled={historyBusy || loading}
                      onClick={(e) => void deleteConversation(c.id, e)}
                      className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-transparent text-white/45 transition hover:border-white/15 hover:bg-white/10 hover:text-rose-200 disabled:pointer-events-none disabled:opacity-40"
                    >
                      <IconX className="size-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    );
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

      const assistantAnswer =
        typeof data.answer === "string" ? data.answer : "No pude generar una respuesta.";

      setMessages((prev) => [...prev, { id: newId(), role: "assistant", content: assistantAnswer }]);
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
    <div className="flex min-h-0 flex-1 flex-col overflow-visible rounded-[var(--radius-lg)] border border-white/10 bg-[color:var(--quipu-night)] text-white shadow-[0_18px_40px_rgba(7,27,74,0.22)]">
      <div className="relative z-20 shrink-0 overflow-visible px-4 pt-5 pb-4 sm:px-6 sm:pt-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold tracking-tight">
              Chateá con tu copiloto financiero
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Hacé preguntas, recibí alertas, recomendaciones y ayuda para tomar decisiones.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
            <div className="relative w-full sm:w-auto">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setHistoryOpen((o) => !o)}
                  aria-expanded={historyOpen}
                  className={[
                    "rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-medium text-white/90 ring-1 ring-white/10 hover:bg-white/15",
                    historyOpen ? "ring-2 ring-[color:var(--quipu-accent)]/50" : "",
                  ].join(" ")}
                >
                  Historial
                </button>
                <button
                  type="button"
                  onClick={startNewChat}
                  className="inline-flex items-center justify-center rounded-full bg-[color:var(--quipu-accent)] px-4 py-2 text-xs font-medium text-white hover:opacity-95 active:translate-y-px sm:text-sm"
                >
                  Nuevo chat
                </button>
              </div>
              {historyOpen ? (
                <div
                  className="absolute left-0 right-0 top-full z-50 mt-2 w-full min-w-0 max-w-full overflow-x-hidden sm:left-auto sm:right-0 sm:w-[min(100%,22.5rem)] sm:max-w-[360px] sm:pr-1"
                  role="dialog"
                  aria-label="Historial de conversaciones"
                >
                  {renderHistoryPanel()}
                </div>
              ) : null}
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/15">
              <IconSparkles className="size-4" />
              Copiloto Quipu
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
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
    </div>
  );
}
