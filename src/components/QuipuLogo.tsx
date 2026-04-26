"use client";

import Image from "next/image";
import { useEffect } from "react";

function agentLog(payload: Record<string, unknown>) {
  // #region agent log
  fetch("http://127.0.0.1:7639/ingest/9497a7e0-b07f-412d-a4f5-fb4971ef2d9b", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "8e053a",
    },
    body: JSON.stringify({
      sessionId: "8e053a",
      timestamp: Date.now(),
      ...payload,
    }),
  }).catch(() => {});
  // #endregion
}

type QuipuLogoProps = {
  className?: string;
};

export function QuipuLogo({ className }: QuipuLogoProps) {
  useEffect(() => {
    // #region agent log
    fetch("/quipu-logo.png", { method: "GET", cache: "no-store" })
      .then((res) => {
        agentLog({
          hypothesisId: "A",
          location: "QuipuLogo.tsx:probe",
          message: "GET /quipu-logo.png response",
          data: {
            status: res.status,
            ok: res.ok,
            contentType: res.headers.get("content-type"),
          },
        });
      })
      .catch((err: unknown) => {
        agentLog({
          hypothesisId: "A",
          location: "QuipuLogo.tsx:probe",
          message: "GET /quipu-logo.png threw",
          data: { error: err instanceof Error ? err.message : String(err) },
        });
      });
    // #endregion
  }, []);

  return (
    <span className={className}>
    <Image
      src="/quipu-logo-transparent.png"
      alt="Quipu"
      width={180}
      height={64}
      priority
      onLoad={() => {
        // #region agent log
        agentLog({
          hypothesisId: "C",
          location: "QuipuLogo.tsx:onLoad",
          message: "next/image onLoad",
          data: {},
        });
        // #endregion
      }}
      onError={() => {
        // #region agent log
        agentLog({
          hypothesisId: "B",
          location: "QuipuLogo.tsx:onError",
          message: "next/image onError",
          data: {},
        });
        // #endregion
      }}
    />
    </span>
  );
}