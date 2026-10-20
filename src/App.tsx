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
import "./App.css";

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
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="TuneSync início">
          <span className="brand-mark" aria-hidden="true">
            TS
          </span>
          <span>
            <strong>TuneSync</strong>
            <small>SPOTIFY COMPANION</small>
          </span>
        </a>
        <span className={`status-indicator ${token ? "is-connected" : ""}`}>
          <span className="status-dot" />
          {token ? "Spotify conectado" : "Aguardando conexão"}
        </span>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <span className="eyebrow">SUA MÚSICA, SEU SOM</span>
          <h1>
            Equalização
            <br />
            <span>para o que toca.</span>
          </h1>
          <p>
            O TuneSync identifica a faixa ativa no Spotify e sugere um ponto de
            partida para o equalizador. Você ajusta os controles no próprio
            Spotify.
          </p>
        </div>
        <div className="sound-visual" aria-hidden="true">
          <div className="sound-ring ring-one" />
          <div className="sound-ring ring-two" />
          <div className="sound-ring ring-three" />
          <div className="sound-bars">
            {[32, 54, 78, 46, 94, 64, 40, 72, 50, 86, 38].map(
              (height, index) => (
                <span key={index} style={{ height: `${height}%` }} />
              ),
            )}
          </div>
        </div>
      </section>

      {!token ? (
        <section className="spotify-connect-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">COMECE POR AQUI</span>
              <h2>Conectar ao Spotify</h2>
            </div>
            <span className="section-number">01</span>
          </div>
          <p className="helper-text">
            O TuneSync usa autorização oficial do Spotify para consultar apenas
            a faixa que está tocando.
          </p>
          <label className="field-label" htmlFor="spotify-client-id">
            Client ID do Spotify Developer
          </label>
          <input
            id="spotify-client-id"
            className="text-input"
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <button className="primary-button connect-button" onClick={handleConnect}>
            Conectar Spotify
          </button>
          <p className="setup-hint">
            O Client ID já está preenchido. Cadastre a URL HTTPS desta página
            como Redirect URI nas configurações do app Spotify. Veja o passo a
            passo no README.
          </p>
        </section>
      ) : (
        <>
          <section className="now-playing-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">AGORA NO SPOTIFY</span>
                <h2>{track ? "Faixa atual" : "Aguardando música"}</h2>
              </div>
              <button
                className="text-button"
                onClick={() => void refreshTrack()}
                disabled={loading}
              >
                {loading ? "Atualizando..." : "Atualizar"}
              </button>
            </div>

            {track ? (
              <div className="now-playing-card">
                {track.imageUrl ? (
                  <img
                    className="album-art"
                    src={track.imageUrl}
                    alt={`Capa do álbum ${track.album}`}
                  />
                ) : (
                  <div className="album-art album-art-placeholder" aria-hidden="true">
                    TS
                  </div>
                )}
                <div className="track-info">
                  <strong>{track.name}</strong>
                  <span>{track.artist}</span>
                  <small>{track.album}</small>
                </div>
                <span
                  className={`playback-state ${
                    track.isPlaying ? "is-playing" : ""
                  }`}
                >
                  {track.isPlaying ? "TOCANDO" : "PAUSADA"}
                </span>
                <div className="track-progress" aria-label="Progresso da faixa">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <div className="track-time">
                  <span>{formatDuration(track.progressMs) ?? "0:00"}</span>
                  <span>{duration ?? "--:--"}</span>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-symbol" aria-hidden="true">
                  ♫
                </div>
                <h3>Nenhuma faixa ativa</h3>
                <p>
                  Comece a tocar uma música no Spotify. O TuneSync verifica a
                  reprodução automaticamente.
                </p>
              </div>
            )}
          </section>

          {track && recommendation && (
            <section className="recommendation-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">SUGESTÃO AUTOMÁTICA</span>
                  <h2>Um ponto de partida</h2>
                </div>
                <span className="recommendation-badge">
                  {recommendation.label}
                </span>
              </div>
              <p className="helper-text recommendation-reason">
                {recommendation.reason}
              </p>
              <div className="equalizer-controls">
                {(
                  [
                    ["bass", "Graves"],
                    ["mids", "Médios"],
                    ["treble", "Agudos"],
                  ] as const
                ).map(([key, label]) => (
                  <label className="eq-control" key={key}>
                    <span className="eq-label-row">
                      <strong>{label}</strong>
                      <output>
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
                      aria-label={`Ajuste de ${label.toLowerCase()}`}
                    />
                  </label>
                ))}
              </div>
              <p className="manual-note">
                Ajuste manualmente os controles equivalentes em Spotify →
                Configurações → Reprodução → Equalizador. O TuneSync não altera
                o áudio nem os controles do Spotify.
              </p>
            </section>
          )}

          <div className="connection-actions">
            <span>Verificação automática a cada 20 segundos</span>
            <button className="text-button" onClick={handleDisconnect}>
              Desconectar
            </button>
          </div>
        </>
      )}

      {error && (
        <div className="error-message" role="alert">
          <span>{error}</span>
          <button
            className="text-button"
            onClick={() => setError(null)}
            aria-label="Fechar aviso"
          >
            Fechar
          </button>
        </div>
      )}

      <footer className="app-footer">
        <span className="footer-brand">TuneSync</span>
        <span>Recomendações são estimativas, não equalização automática.</span>
        <span className="footer-note">
          O Spotify e o TuneSync são serviços independentes.
        </span>
      </footer>
    </main>
  );
}

export default App;
