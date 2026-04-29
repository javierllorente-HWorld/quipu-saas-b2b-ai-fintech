import * as React from "react";
import { useRouter } from "next/navigation";

type NavigateKey =
  | "inicio"
  | "caja"
  | "cobros"
  | "pagos"
  | "tesoreria"
  | "reportes"
  | "ia"
  | "help";

type UseSidebarNavigateOptions = {
  onAfterNavigate?: () => void;
};

function pathForKey(key: NavigateKey) {
  switch (key) {
    case "inicio":
      return "/inicio";
    case "caja":
      return "/caja";
    case "cobros":
      return "/cobros";
    case "pagos":
      return "/pagos";
    default:
      return null;
  }
}

export function useSidebarNavigate(options?: UseSidebarNavigateOptions) {
  const router = useRouter();

  return React.useCallback(
    (key: string) => {
      const path = pathForKey(key as NavigateKey);
      if (!path) return;
      router.push(path);
      options?.onAfterNavigate?.();
    },
    [router, options],
  );
}

