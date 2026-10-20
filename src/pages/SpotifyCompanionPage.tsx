import { useCallback, useEffect, useRef, useState } from "react";
import AppFooter from "../components/AppFooter";
import AppHeader from "../components/AppHeader";
import EqualizerRecommendationCard from "../components/EqualizerRecommendationCard";
import FeedbackMessage from "../components/FeedbackMessage";
import HeroSection from "../components/HeroSection";
import NowPlayingSection from "../components/NowPlayingSection";
import SpotifyConnectionForm from "../components/SpotifyConnectionForm";
import type {
  Equalizer,
  EqualizerRecommendation,
} from "../schemas/equalizer";
import type { SpotifyToken, SpotifyTrack } from "../schemas/spotify";
import { recommendEqualizer } from "../services/recommendation";
import {
  completeSpotifyAuthorization,
  connectSpotify,
  disconnectSpotify,
  getCurrentTrack,
  getSavedClientId,
  getSavedToken,
  getUpdatedToken,
} from "../services/spotify";

const POLL_INTERVAL_MS = 20_000;

export default function SpotifyCompanion() {
  const [clientId, setClientId] = useState(getSavedClientId);
  const [token, setToken] = useState<SpotifyToken | null>(getSavedToken);
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
  const recommendedTrackKey = useRef<string | null>(null);

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

        const trackKey =
          currentTrack.id ?? `${currentTrack.name}:${currentTrack.artist}`;
        if (recommendedTrackKey.current !== trackKey) {
          recommendedTrackKey.current = trackKey;
          setEqualizer(nextRecommendation.equalizer);
        }
      } else {
        recommendedTrackKey.current = null;
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
      recommendedTrackKey.current = null;
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

  return (
    <main className="min-h-screen bg-background px-4 text-foreground sm:px-6">
      <div className="mx-auto min-h-screen w-full max-w-[70rem]">
        <AppHeader connected={Boolean(token)} />
        <HeroSection />

        {!token ? (
          <SpotifyConnectionForm
            clientId={clientId}
            onClientIdChange={setClientId}
            onConnect={() => void handleConnect()}
          />
        ) : (
          <>
            <NowPlayingSection
              track={track}
              loading={loading}
              onRefresh={() => void refreshTrack()}
            />

            {track && recommendation && (
              <EqualizerRecommendationCard
                recommendation={recommendation}
                equalizer={equalizer}
                onEqualizerChange={updateEqualizer}
              />
            )}

            <div className="mt-4 flex items-center justify-between gap-4 text-[0.7rem] text-text-disabled">
              <span>Verificação automática a cada 20 segundos</span>
              <button
                className="min-h-10 rounded-[0.625rem] border border-foreground/15 px-3 text-xs text-text-subtle transition hover:border-accent/40 hover:bg-accent/10"
                onClick={handleDisconnect}
              >
                Desconectar
              </button>
            </div>
          </>
        )}

        {error && (
          <FeedbackMessage message={error} onDismiss={() => setError(null)} />
        )}

        <AppFooter />
      </div>
    </main>
  );
}
