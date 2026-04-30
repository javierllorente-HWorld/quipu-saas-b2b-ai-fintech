export const DEMO_CREDENTIALS = {
  email: "demo@quipu.com",
  password: "Demo1234",
} as const;

export const DEMO_COMPANY_ID = "acme-ar" as const;

export const DEMO_USER = {
  name: "Martín Rivas",
  role: "CFO",
  email: DEMO_CREDENTIALS.email,
} as const;

export const DEMO_SESSION_KEY = "quipu_demo_session" as const;

export type DemoSession = {
  companyId: string;
  user: {
    name: string;
    role: string;
    email: string;
  };
};

function safeParseSession(raw: string | null): DemoSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DemoSession;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.companyId !== "string" ||
      !parsed.user ||
      typeof parsed.user !== "object" ||
      typeof parsed.user.name !== "string" ||
      typeof parsed.user.role !== "string" ||
      typeof parsed.user.email !== "string"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getDemoSession(): DemoSession | null {
  if (!canUseStorage()) return null;
  return safeParseSession(window.localStorage.getItem(DEMO_SESSION_KEY));
}

export function isDemoAuthed() {
  return Boolean(getDemoSession());
}

export function signInDemo(email: string, password: string) {
  const ok =
    email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
    password === DEMO_CREDENTIALS.password;

  if (!ok) {
    return { ok: false as const, error: "Credenciales inválidas." };
  }

  if (canUseStorage()) {
    const session: DemoSession = {
      companyId: DEMO_COMPANY_ID,
      user: { ...DEMO_USER },
    };
    window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
  }

  return { ok: true as const };
}

export function signOutDemo() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(DEMO_SESSION_KEY);
}

