type SpotifyConnectionFormProps = {
  clientId: string;
  onClientIdChange: (value: string) => void;
  onConnect: () => void;
};

export default function SpotifyConnectionForm({
  clientId,
  onClientIdChange,
  onConnect,
}: SpotifyConnectionFormProps) {
  return (
    <section className="mt-5 rounded-[1.125rem] border border-foreground/10 bg-gradient-to-br from-surface-raised to-surface p-5 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-[0.65rem] font-bold tracking-[0.16em] text-accent">
            COMECE POR AQUI
          </span>
          <h2 className="mt-1.5 font-semibold tracking-tight">
            Conectar ao Spotify
          </h2>
        </div>
        <span className="text-xs text-text-low">01</span>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted">
        O TuneSync usa autorização oficial do Spotify para consultar apenas a
        faixa que está tocando.
      </p>
      <label
        className="mb-2 mt-6 block text-xs font-semibold text-text-primary"
        htmlFor="spotify-client-id"
      >
        Client ID do Spotify Developer
      </label>
      <input
        id="spotify-client-id"
        className="min-h-11 w-full rounded-[0.625rem] border border-foreground/15 bg-background px-3.5 text-sm text-foreground outline-none placeholder:text-text-placeholder focus:border-accent focus:ring-2 focus:ring-accent/20"
        value={clientId}
        onChange={(event) => onClientIdChange(event.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
      <button
        className="mt-4 min-h-11 w-full rounded-[0.625rem] bg-accent px-5 text-sm font-bold text-accent-foreground transition hover:-translate-y-px hover:bg-accent-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        onClick={onConnect}
      >
        Conectar Spotify
      </button>
      <p className="mt-3.5 text-[0.7rem] leading-relaxed text-text-disabled">
        Insira o Client ID de desenvolvimento e cadastre a URL de teste como
        Redirect URI no Spotify Developer Dashboard.
      </p>
    </section>
  );
}
