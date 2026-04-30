"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getDemoSession } from "@/lib/demoAuth";

export function useRequireDemoAuth() {
  const router = useRouter();
  const [session, setSession] = React.useState(() => getDemoSession());

  React.useEffect(() => {
    const current = getDemoSession();
    setSession(current);
    if (!current) {
      router.replace("/login");
    }
  }, [router]);

  return session;
}

