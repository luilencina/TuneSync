import type { SpotifyTrack } from "../schemas/spotify";
import { formatDuration } from "../utils/formatDuration";

type NowPlayingSectionProps = {
  track: SpotifyTrack | null;
  loading: boolean;
  onRefresh: () => void;
};

export default function NowPlayingSection({
  track,
  loading,
  onRefresh,
}: NowPlayingSectionProps) {
  const progress = track?.durationMs
    ? Math.min(100, ((track.progressMs ?? 0) / track.durationMs) * 100)
    : 0;

  return (
    <section className="mt-5 rounded-[1.125rem] border border-foreground/10 bg-gradient-to-br from-surface-raised to-surface p-5 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-[0.65rem] font-bold tracking-[0.16em] text-accent">
            AGORA NO SPOTIFY
          </span>
          <h2 className="mt-1.5 font-semibold tracking-tight">
            {track ? "Faixa atual" : "Aguardando música"}
          </h2>
        </div>
        <button
          className="min-h-10 rounded-[0.625rem] border border-foreground/15 px-3 text-xs text-text-subtle transition hover:border-accent/40 hover:bg-accent/10 disabled:cursor-wait disabled:opacity-60"
          onClick={onRefresh}
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
            <div
              className="row-span-2 grid size-16 place-items-center rounded-[0.625rem] bg-accent/10 text-xl font-bold text-accent sm:size-[5.375rem]"
              aria-hidden="true"
            >
              TS
            </div>
          )}
          <div className="col-start-2 grid min-w-0 gap-1">
            <strong className="truncate text-sm font-semibold sm:text-base">
              {track.name}
            </strong>
            <span className="truncate text-xs text-text-primary">
              {track.artist}
            </span>
            <small className="truncate text-[0.7rem] text-text-disabled">
              {track.album}
            </small>
          </div>
          <span
            className={`col-start-2 text-[0.6rem] font-bold tracking-widest sm:col-start-3 ${
              track.isPlaying ? "text-accent" : "text-text-disabled"
            }`}
          >
            {track.isPlaying ? "TOCANDO" : "PAUSADA"}
          </span>
          <div
            className="col-span-2 h-1 overflow-hidden rounded-full bg-foreground/15 sm:col-start-2"
            aria-label="Progresso da faixa"
          >
            <span
              className="block h-full rounded-full bg-accent"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="col-span-2 flex justify-between font-mono text-[0.65rem] tabular-nums text-text-disabled sm:col-start-2">
            <span>{formatDuration(track.progressMs) ?? "0:00"}</span>
            <span>{formatDuration(track.durationMs) ?? "--:--"}</span>
          </div>
        </div>
      ) : (
        <div className="flex min-h-52 flex-col items-center justify-center rounded-[0.875rem] border border-dashed border-foreground/15 p-6 text-center">
          <div
            className="mb-3 grid size-12 place-items-center rounded-xl border border-accent/40 text-lg font-bold text-accent"
            aria-hidden="true"
          >
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
  );
}
