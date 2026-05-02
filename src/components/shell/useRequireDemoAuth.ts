"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getDemoSession } from "@/lib/demoAuth";

export function useRequireDemoAuth() {
  const router = useRouter();
  const [session] = React.useState(() => getDemoSession());

  React.useEffect(() => {
    if (!getDemoSession()) {
      router.replace("/login");
    }
  }, [router]);

  return session;
}

