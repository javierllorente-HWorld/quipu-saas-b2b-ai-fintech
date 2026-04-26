export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-sm text-black/70 backdrop-blur dark:border-white/15 dark:bg-white/5 dark:text-white/70">
          <span className="size-2 rounded-full bg-emerald-500" />
          Base del proyecto lista para desarrollo
        </div>

        <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Quipu
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-lg leading-8 text-black/70 dark:text-white/70">
          SaaS B2B fintech para gestión financiera de pymes en LATAM: caja, cobros,
          pagos, reportes y proyecciones.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-white/60 p-5 backdrop-blur dark:border-white/15 dark:bg-white/5">
            <div className="text-sm font-medium">Stack</div>
            <div className="mt-2 text-sm text-black/70 dark:text-white/70">
              Next.js + TypeScript + Tailwind
            </div>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white/60 p-5 backdrop-blur dark:border-white/15 dark:bg-white/5">
            <div className="text-sm font-medium">Objetivo</div>
            <div className="mt-2 text-sm text-black/70 dark:text-white/70">
              Base limpia, sin features complejas todavía
            </div>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white/60 p-5 backdrop-blur dark:border-white/15 dark:bg-white/5">
            <div className="text-sm font-medium">Próximo</div>
            <div className="mt-2 text-sm text-black/70 dark:text-white/70">
              Auth, dashboard y módulos del MVP
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition hover:opacity-90"
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noreferrer"
          >
            Docs de Next.js
          </a>
          <a
            className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white/60 px-5 text-sm font-medium transition hover:bg-white/80 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
            href="https://tailwindcss.com/docs"
            target="_blank"
            rel="noreferrer"
          >
            Docs de Tailwind
          </a>
        </div>
      </div>
    </main>
  );
}
