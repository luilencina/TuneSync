import {
  EQUALIZER_BANDS,
  type Equalizer,
  type EqualizerRecommendation,
} from "../schemas/equalizer";

type EqualizerRecommendationCardProps = {
  recommendation: EqualizerRecommendation;
  equalizer: Equalizer;
  onEqualizerChange: (key: keyof Equalizer, value: number) => void;
};

export default function EqualizerRecommendationCard({
  recommendation,
  equalizer,
  onEqualizerChange,
}: EqualizerRecommendationCardProps) {
  return (
    <section className="mt-5 rounded-[1.125rem] border border-foreground/10 bg-gradient-to-br from-surface-raised to-surface p-5 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-[0.65rem] font-bold tracking-[0.16em] text-accent">
            SUGESTÃO AUTOMÁTICA
          </span>
          <h2 className="mt-1.5 font-semibold tracking-tight">
            Um ponto de partida
          </h2>
        </div>
        <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-2 text-[0.65rem] font-bold text-accent">
          {recommendation.label}
        </span>
      </div>
      <p className="mb-5 mt-4 text-xs leading-relaxed text-text-muted">
        {recommendation.reason}
      </p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {EQUALIZER_BANDS.map(({ key, label }) => (
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
                onEqualizerChange(key, Number(event.target.value))
              }
              className="w-full accent-accent"
              aria-label={`Ajuste de ${label.toLowerCase()}`}
            />
          </label>
        ))}
      </div>
      <p className="mt-5 text-[0.7rem] leading-relaxed text-text-disabled">
        Ajuste manualmente os controles equivalentes em Spotify → Configurações
        → Reprodução → Equalizador. O TuneSync não altera o áudio nem os
        controles do Spotify.
      </p>
    </section>
  );
}
