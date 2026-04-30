/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { isDemoAuthed, signInDemo } from "@/lib/demoAuth";

function BenefitIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex size-9 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
      {children}
    </span>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isDemoAuthed()) {
      router.replace("/inicio");
    }
  }, [router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = signInDemo(email, password);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push("/inicio");
  }

  return (
    <div className="qp-shell">
      <div className="min-h-screen md:grid md:grid-cols-2">
        {/* Left brand panel */}
        <section className="relative overflow-hidden bg-[color:var(--quipu-night)] text-white">
          <div className="pointer-events-none absolute inset-0">
            {/* Background image */}
            <div className="absolute inset-0 bg-[url('/login-left-bg.png')] bg-cover bg-center bg-no-repeat" />

            {/* Contrast overlays to keep text premium/legible */}
            <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_14%_18%,rgba(46,107,255,0.22)_0%,rgba(7,27,74,0)_60%),linear-gradient(135deg,rgba(7,27,74,0.78)_0%,rgba(10,47,122,0.62)_55%,rgba(7,27,74,0.82)_100%)]" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
          </div>

          <div className="relative flex min-h-screen flex-col px-6 py-10 sm:px-10 md:px-12">
            <div className="flex flex-1 flex-col pt-4 md:pt-6">
              <div className="flex min-h-[60vh] flex-col justify-between">
                <div>
                  <div className="mb-8">
                    <img
                      src="/ISOLOGO%20BLANCO.png"
                      alt="Quipu"
                      className="h-auto w-[190px] object-contain drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)]"
                    />
                  </div>

                  <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
                    Finanzas simples
                    <br />
                    para{" "}
                    <span className="text-[color:var(--quipu-accent)]">pymes</span>
                  </h1>
                  <p className="mt-4 max-w-xl text-pretty text-lg leading-7 text-white/75">
                    Controlá tu negocio con inteligencia.
                    <br />
                    Decidí mejor, todos los días.
                  </p>
                </div>

                <div className="mt-10 grid gap-6">
                  <div className="flex gap-4">
                    <BenefitIcon>
                      <svg
                        viewBox="0 0 24 24"
                        className="size-5"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 3a9 9 0 1 0 9 9"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                        <path
                          d="M7.5 12.3l2.5 2.6L16.8 8.2"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </BenefitIcon>
                    <div>
                      <div className="text-base font-semibold">
                        Visibilidad total de tu caja
                      </div>
                      <div className="mt-1 text-sm leading-6 text-white/75">
                        Monitoreá ingresos, egresos y proyecciones en tiempo real.
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <BenefitIcon>
                      <svg
                        viewBox="0 0 24 24"
                        className="size-5"
                        aria-hidden="true"
                      >
                        <path
                          d="M6 7h12M6 12h12M6 17h9"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </BenefitIcon>
                    <div>
                      <div className="text-base font-semibold">
                        Cobros y pagos centralizados
                      </div>
                      <div className="mt-1 text-sm leading-6 text-white/75">
                        Gestión de clientes, proveedores y cuentas por cobrar
                        desde un solo lugar.
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <BenefitIcon>
                      <svg
                        viewBox="0 0 24 24"
                        className="size-5"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 2.8l2.4 5 5.5.8-4 3.9.9 5.5-4.8-2.6-4.8 2.6.9-5.5-4-3.9 5.5-.8 2.4-5Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </BenefitIcon>
                    <div>
                      <div className="text-base font-semibold">
                        Copiloto IA inteligente
                      </div>
                      <div className="mt-1 text-sm leading-6 text-white/75">
                        Recibí alertas y recomendaciones para tomar mejores
                        decisiones.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pb-2 pt-8 text-xs text-white/55">
              Quipu · SaaS B2B fintech para pymes LATAM
            </div>
          </div>
        </section>

        {/* Right login card */}
        <section className="flex items-center justify-center bg-background px-6 py-12 sm:px-10 md:px-12">
          <div className="w-full max-w-md">
            <div className="qp-card">
              <div className="qp-card-header">
                <div className="mb-6 flex justify-center">
                  <img
                    src="/quipu-logo-transparent.png"
                    alt="Quipu"
                    className="w-[140px] h-auto object-contain"
                  />
                </div>
                <h2 className="text-center text-2xl font-semibold tracking-tight">
                  Iniciar sesión
                </h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Ingresá a tu cuenta para continuar.
                </p>
              </div>

              <div className="qp-card-content">
                <form className="space-y-4" onSubmit={onSubmit}>
                  <div className="space-y-2">
                    <label className="qp-label" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      className="qp-input"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="qp-label" htmlFor="password">
                      Contraseña
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className="qp-input"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {error ? (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-700">
                      {error}
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between gap-4 pt-1">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-[color:var(--border)] accent-[color:var(--primary)]"
                        defaultChecked
                      />
                      Recordarme
                    </label>
                    <a
                      href="#"
                      className="text-sm font-medium text-[color:var(--primary)] hover:underline"
                    >
                      Olvidé mi contraseña
                    </a>
                  </div>

                  <button type="submit" className="qp-btn-primary w-full">
                    Ingresar
                  </button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="h-px w-full bg-[color:var(--border)]" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-card px-3 text-xs text-muted-foreground">
                        o
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="qp-btn-secondary w-full gap-2"
                  >
                    <img src="/google.png" alt="" className="h-5 w-5" />
                    Continuar con Google
                  </button>

                  <p className="pt-2 text-center text-sm text-muted-foreground">
                    ¿No tenés cuenta?{" "}
                    <a
                      href="#"
                      className="font-medium text-[color:var(--primary)] hover:underline"
                    >
                      Contactar ventas
                    </a>
                  </p>
                </form>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Tu información está protegida con cifrado de nivel bancario.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

