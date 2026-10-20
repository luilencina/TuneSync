import { lazy, Suspense } from "react";

const DevelopmentApp = import.meta.env.DEV
  ? lazy(() => import("./App.development"))
  : null;

function ProductionApp() {
  return (
    <main className="min-h-screen bg-background px-4 text-foreground sm:px-6">
      <div className="mx-auto min-h-screen w-full max-w-[70rem]">
      <header className="flex min-h-[5.5rem] items-center justify-between border-b border-foreground/10">
        <a className="inline-flex items-center gap-3 text-inherit no-underline" href="#home" aria-label="TuneSync início">
          <span className="grid size-[2.625rem] place-items-center rounded-[0.8rem] border border-accent/40 text-[0.95rem] font-bold text-accent" aria-hidden="true">
            TS
          </span>
          <span>
            <strong className="block font-semibold tracking-tight">TuneSync</strong>
            <small className="mt-0.5 block text-[0.6rem] tracking-[0.14em] text-text-faint">EM DESENVOLVIMENTO</small>
          </span>
        </a>
      </header>

      <section className="flex min-h-[24rem] items-center py-14" id="home">
        <div className="max-w-[38rem]">
          <span className="text-[0.65rem] font-bold tracking-[0.16em] text-accent">TUNESYNC</span>
          <h1 className="my-4 text-5xl font-semibold leading-[1.02] tracking-[-0.065em] sm:text-7xl">
            Estamos
            <br />
            <span className="text-accent">em desenvolvimento.</span>
          </h1>
          <p className="max-w-[30rem] text-sm leading-7 text-text-muted">
            Esta versão pública ainda não oferece conexão com o Spotify,
            recomendações ou ajustes de equalização.
          </p>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 py-8 text-xs text-text-quiet">
        <span className="font-semibold text-foreground-strong">TuneSync</span>
        <span>Mais novidades em breve.</span>
      </footer>
      </div>
    </main>
  );
}

export default function App() {
  if (DevelopmentApp) {
    return (
      <Suspense fallback={<main className="min-h-screen bg-background" />}>
        <DevelopmentApp />
      </Suspense>
    );
  }

  return <ProductionApp />;
}
