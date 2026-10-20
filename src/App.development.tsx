import { useCallback, useEffect, useState } from "react";
import {
  completeSpotifyAuthorization,
  connectSpotify,
  disconnectSpotify,
  getCurrentTrack,
  getSavedClientId,
  getSavedToken,
  getUpdatedToken,
  type SpotifyTrack,
} from "./services/spotify";
import {
  recommendEqualizer,
  type EqualizerRecommendation,
} from "./services/recommendation";
import type { Equalizer } from "./types/components";

const POLL_INTERVAL_MS = 20_000;

function formatDuration(milliseconds: number | null) {
  if (milliseconds === null) return null;

  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function App() {
  const [clientId, setClientId] = useState(getSavedClientId);
  const [token, setToken] = useState(getSavedToken);
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [recommendation, setRecommendation] =
    useState<EqualizerRecommendation | null>(null);
  const [equalizer, setEqualizer] = useState<Equalizer>({
    bass: 0,
    mids: 0,
    treble: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function finishAuthorization() {
      try {
        const result = await completeSpotifyAuthorization();
        if (cancelled || !result) return;

        setToken(result.token);
        setClientId(result.clientId);
        setError(null);
      } catch (authorizationError) {
        if (!cancelled) {
          setError(
            authorizationError instanceof Error
              ? authorizationError.message
              : "Não foi possível concluir a conexão com o Spotify.",
          );
        }
      }
    }

    void finishAuthorization();

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshTrack = useCallback(async () => {
    if (!token) return;

    setLoading(true);

    try {
      const currentTrack = await getCurrentTrack(token);
      const updatedToken = getUpdatedToken(token);
      if (updatedToken !== token) setToken(updatedToken);
      setTrack(currentTrack);
      setError(
        currentTrack?.genreWarning
          ? `A faixa foi identificada, mas não consegui consultar o gênero do artista: ${currentTrack.genreWarning}`
          : null,
      );

      if (currentTrack) {
        const nextRecommendation = recommendEqualizer(currentTrack.genres);
        setRecommendation(nextRecommendation);
        setEqualizer(nextRecommendation.equalizer);
      } else {
        setRecommendation(null);
      }
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "Não foi possível consultar a faixa atual.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setTrack(null);
      setRecommendation(null);
      return;
    }

    void refreshTrack();
    const intervalId = window.setInterval(
      () => void refreshTrack(),
      POLL_INTERVAL_MS,
    );

    return () => window.clearInterval(intervalId);
  }, [refreshTrack, token]);

  async function handleConnect() {
    if (!clientId.trim()) {
      setError("Informe o Client ID do seu aplicativo no Spotify Developer.");
      return;
    }

    try {
      setError(null);
      await connectSpotify(clientId.trim());
    } catch (connectionError) {
      setError(
        connectionError instanceof Error
          ? connectionError.message
          : "Não foi possível iniciar a conexão com o Spotify.",
      );
    }
  }

  function handleDisconnect() {
    disconnectSpotify();
    setToken(null);
    setTrack(null);
    setRecommendation(null);
    setError(null);
  }

  function updateEqualizer(key: keyof Equalizer, value: number) {
    setEqualizer((current) => ({ ...current, [key]: value }));
  }

  const duration = formatDuration(track?.durationMs ?? null);
  const progress = track?.durationMs
    ? Math.min(
        100,
        ((track.progressMs ?? 0) / track.durationMs) * 100,
      )
    : 0;

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
            <small className="mt-0.5 block text-[0.6rem] tracking-[0.14em] text-text-faint">SPOTIFY COMPANION</small>
          </span>
        </a>
        <span className="inline-flex items-center gap-2 text-xs text-text-secondary">
          <span className={`size-2 rounded-full ${token ? "bg-accent shadow-accent-indicator" : "bg-text-low"}`} />
          {token ? "Spotify conectado" : "Aguardando conexão"}
        </span>
      </header>

      <section className="relative flex min-h-[23.75rem] items-center overflow-hidden py-14" id="home">
        <div className="relative z-10 max-w-[38rem]">
          <span className="text-[0.65rem] font-bold tracking-[0.16em] text-accent">SUA MÚSICA, SEU SOM</span>
          <h1 className="my-4 text-5xl font-semibold leading-[1.02] tracking-[-0.065em] sm:text-7xl">
            Equalização
            <br />
            <span className="text-accent">para o que toca.</span>
          </h1>
          <p className="mb-6 max-w-[30rem] text-sm leading-7 text-text-muted">
            O TuneSync identifica a faixa ativa no Spotify e sugere um ponto de
            partida para o equalizador. Você ajusta os controles no próprio
            Spotify.
          </p>
        </div>
        <div className="pointer-events-none absolute right-0 top-1/2 hidden size-[20rem] -translate-y-1/2 items-center justify-center sm:flex">
          <div className="absolute size-44 rounded-full border border-accent/10" />
          <div className="absolute size-64 rounded-full border border-accent/10" />
          <div className="absolute size-80 rounded-full border border-accent/10" />
          <div className="relative flex h-28 items-center gap-[7px]">
            {[32, 54, 78, 46, 94, 64, 40, 72, 50, 86, 38].map(
              (height, index) => (
                <span key={index} className="w-1.5 min-h-3 rounded-full bg-gradient-to-b from-accent-light to-accent-deep shadow-accent-bars" style={{ height: `${height}%` }} />
              ),
            )}
          </div>
        </div>
      </section>

      {!token ? (
        <section className="mt-5 rounded-[1.125rem] border border-foreground/10 bg-gradient-to-br from-surface-raised to-surface p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-[0.65rem] font-bold tracking-[0.16em] text-accent">COMECE POR AQUI</span>
              <h2 className="mt-1.5 font-semibold tracking-tight">Conectar ao Spotify</h2>
            </div>
            <span className="text-xs text-text-low">01</span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted">
            O TuneSync usa autorização oficial do Spotify para consultar apenas
            a faixa que está tocando.
          </p>
          <label className="mb-2 mt-6 block text-xs font-semibold text-text-primary" htmlFor="spotify-client-id">
            Client ID do Spotify Developer
          </label>
          <input
            id="spotify-client-id"
            className="min-h-11 w-full rounded-[0.625rem] border border-foreground/15 bg-background px-3.5 text-sm text-foreground outline-none placeholder:text-text-placeholder focus:border-accent focus:ring-2 focus:ring-accent/20"
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <button className="mt-4 min-h-11 w-full rounded-[0.625rem] bg-accent px-5 text-sm font-bold text-accent-foreground transition hover:-translate-y-px hover:bg-accent-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" onClick={handleConnect}>
            Conectar Spotify
          </button>
          <p className="mt-3.5 text-[0.7rem] leading-relaxed text-text-disabled">
            Insira o Client ID de desenvolvimento e cadastre a URL de teste
            como Redirect URI no Spotify Developer Dashboard.
          </p>
        </section>
      ) : (
        <>
          <section className="mt-5 rounded-[1.125rem] border border-foreground/10 bg-gradient-to-br from-surface-raised to-surface p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-[0.65rem] font-bold tracking-[0.16em] text-accent">AGORA NO SPOTIFY</span>
                <h2 className="mt-1.5 font-semibold tracking-tight">{track ? "Faixa atual" : "Aguardando música"}</h2>
              </div>
              <button
                className="min-h-10 rounded-[0.625rem] border border-foreground/15 px-3 text-xs text-text-subtle transition hover:border-accent/40 hover:bg-accent/10 disabled:cursor-wait disabled:opacity-60"
                onClick={() => void refreshTrack()}
                disabled={loading}
              >
                {loading ? "Atualizando..." : "Atualizar"}
              </button>
            </div>

            {track ? (
              <div className="mt-5 grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-3 rounded-[0.875rem] border border-foreground/10 bg-background/50 p-3 sm:grid-cols-[5.375rem_minmax(0,1fr)_auto] sm:gap-4 sm:p-4">
                {track.imageUrl ? (
                  <img
                    className="row-span-2 size-16 rounded-[0.625rem] object-cover sm:size-[5.375rem]"
                    src={track.imageUrl}
                    alt={`Capa do álbum ${track.album}`}
                  />
                ) : (
                  <div className="row-span-2 grid size-16 place-items-center rounded-[0.625rem] bg-accent/10 text-xl font-bold text-accent sm:size-[5.375rem]" aria-hidden="true">
                    TS
                  </div>
                )}
                <div className="col-start-2 grid min-w-0 gap-1">
                  <strong className="truncate text-sm font-semibold sm:text-base">{track.name}</strong>
                  <span className="truncate text-xs text-text-primary">{track.artist}</span>
                  <small className="truncate text-[0.7rem] text-text-disabled">{track.album}</small>
                </div>
                <span
                  className={`col-start-2 text-[0.6rem] font-bold tracking-widest sm:col-start-3 ${track.isPlaying ? "text-accent" : "text-text-disabled"}`}
                >
                  {track.isPlaying ? "TOCANDO" : "PAUSADA"}
                </span>
                <div className="col-span-2 h-1 overflow-hidden rounded-full bg-foreground/15 sm:col-start-2" aria-label="Progresso da faixa">
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
                </div>
                <div className="col-span-2 flex justify-between font-mono text-[0.65rem] tabular-nums text-text-disabled sm:col-start-2">
                  <span>{formatDuration(track.progressMs) ?? "0:00"}</span>
                  <span>{duration ?? "--:--"}</span>
                </div>
              </div>
            ) : (
              <div className="flex min-h-52 flex-col items-center justify-center rounded-[0.875rem] border border-dashed border-foreground/15 p-6 text-center">
                <div className="mb-3 grid size-12 place-items-center rounded-xl border border-accent/40 text-lg font-bold text-accent" aria-hidden="true">
                  ♫
                </div>
                <h3 className="font-semibold">Nenhuma faixa ativa</h3>
                <p className="mt-1 max-w-md text-sm leading-relaxed text-text-dim">
                  Comece a tocar uma música no Spotify. O TuneSync verifica a
                  reprodução automaticamente.
                </p>
              </div>
            )}
          </section>

          {track && recommendation && (
            <section className="mt-5 rounded-[1.125rem] border border-foreground/10 bg-gradient-to-br from-surface-raised to-surface p-5 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-[0.65rem] font-bold tracking-[0.16em] text-accent">SUGESTÃO AUTOMÁTICA</span>
                  <h2 className="mt-1.5 font-semibold tracking-tight">Um ponto de partida</h2>
                </div>
                <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-2 text-[0.65rem] font-bold text-accent">
                  {recommendation.label}
                </span>
              </div>
              <p className="mb-5 mt-4 text-xs leading-relaxed text-text-muted">
                {recommendation.reason}
              </p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {(
                  [
                    ["bass", "Graves"],
                    ["mids", "Médios"],
                    ["treble", "Agudos"],
                  ] as const
                ).map(([key, label]) => (
                  <label className="grid gap-2.5" key={key}>
                    <span className="flex items-center justify-between">
                      <strong className="text-xs">{label}</strong>
                      <output className="text-xs tabular-nums text-accent">
                        {equalizer[key] > 0 ? "+" : ""}
                        {equalizer[key]} dB
                      </output>
                    </span>
                    <input
                      type="range"
                      min="-6"
                      max="6"
                      step="1"
                      value={equalizer[key]}
                      onChange={(event) =>
                        updateEqualizer(key, Number(event.target.value))
                      }
                      className="w-full accent-accent"
                      aria-label={`Ajuste de ${label.toLowerCase()}`}
                    />
                  </label>
                ))}
              </div>
              <p className="mt-5 text-[0.7rem] leading-relaxed text-text-disabled">
                Ajuste manualmente os controles equivalentes em Spotify →
                Configurações → Reprodução → Equalizador. O TuneSync não altera
                o áudio nem os controles do Spotify.
              </p>
            </section>
          )}

          <div className="mt-4 flex items-center justify-between gap-4 text-[0.7rem] text-text-disabled">
            <span>Verificação automática a cada 20 segundos</span>
            <button className="min-h-10 rounded-[0.625rem] border border-foreground/15 px-3 text-xs text-text-subtle transition hover:border-accent/40 hover:bg-accent/10" onClick={handleDisconnect}>
              Desconectar
            </button>
          </div>
        </>
      )}

      {error && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-[0.625rem] border border-danger/30 bg-danger/5 p-3 text-xs leading-relaxed text-danger-light" role="alert">
          <span>{error}</span>
          <button
            className="min-h-10 flex-none rounded-[0.625rem] border border-foreground/15 px-3 text-xs text-text-subtle hover:bg-foreground/5"
            onClick={() => setError(null)}
            aria-label="Fechar aviso"
          >
            Fechar
          </button>
        </div>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-3 py-8 text-[0.7rem] text-text-quiet">
        <span className="font-semibold text-foreground-strong">TuneSync</span>
        <span>Recomendações são estimativas, não equalização automática.</span>
        <span>
          O Spotify e o TuneSync são serviços independentes.
        </span>
      </footer>
      </div>
    </main>
  );
}

export default App;
