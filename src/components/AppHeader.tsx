type AppHeaderProps = {
  connected: boolean;
};

export default function AppHeader({ connected }: AppHeaderProps) {
  return (
    <header className="flex min-h-[5.5rem] items-center justify-between border-b border-foreground/10">
      <a
        className="inline-flex items-center gap-3 text-inherit no-underline"
        href="#home"
        aria-label="TuneSync início"
      >
        <span
          className="grid size-[2.625rem] place-items-center rounded-[0.8rem] border border-accent/40 text-[0.95rem] font-bold text-accent"
          aria-hidden="true"
        >
          TS
        </span>
        <span>
          <strong className="block font-semibold tracking-tight">TuneSync</strong>
          <small className="mt-0.5 block text-[0.6rem] tracking-[0.14em] text-text-faint">
            SPOTIFY COMPANION
          </small>
        </span>
      </a>
      <span className="inline-flex items-center gap-2 text-xs text-text-secondary">
        <span
          className={`size-2 rounded-full ${
            connected ? "bg-accent shadow-accent-indicator" : "bg-text-low"
          }`}
        />
        {connected ? "Spotify conectado" : "Aguardando conexão"}
      </span>
    </header>
  );
}
