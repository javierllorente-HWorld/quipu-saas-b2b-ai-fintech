"use client";

import * as React from "react";
import type { ChatMessage } from "./mock";

export type CopilotChatCardProps = {
  title: string;
  messages: ChatMessage[];
};

function Bubble({
  role,
  text,
  timestamp,
}: {
  role: ChatMessage["role"];
  text: string;
  timestamp?: string;
}) {
  const isUser = role === "user";
  return (
    <div className={["flex", isUser ? "justify-end" : "justify-start"].join(" ")}>
      <div
        className={[
          "max-w-[84%] rounded-2xl border border-border px-4 py-3 text-sm leading-6",
          isUser
            ? "bg-[color:var(--quipu-ice)] text-[color:var(--quipu-night)]"
            : "bg-white/60 text-foreground",
        ].join(" ")}
      >
        <div className="whitespace-pre-wrap">{text}</div>
        {timestamp ? (
          <div className="mt-2 text-[11px] text-muted-foreground">{timestamp}</div>
        ) : null}
      </div>
    </div>
  );
}

function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
    </svg>
  );
}

export function CopilotChatCard({ title, messages }: CopilotChatCardProps) {
  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">{title}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Experiencia mock (sin IA real aún).
            </div>
          </div>
        </div>
      </div>
      <div className="qp-card-content">
        <div className="space-y-3">
          {messages.map((m) => (
            <Bubble
              key={m.id}
              role={m.role}
              text={m.text}
              timestamp={m.timestamp}
            />
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-white/60 p-3">
          <div className="flex items-center gap-2">
            <input
              className="qp-input h-10"
              placeholder="Escribí tu consulta…"
              disabled
            />
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground opacity-70"
              aria-label="Enviar"
              disabled
            >
              <SendIcon />
            </button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Este chat es solo una vista previa visual. No se envían mensajes.
          </div>
        </div>
      </div>
    </div>
  );
}

