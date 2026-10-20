import type { Equalizer, EqualizerRecommendation } from "../schemas/equalizer";

const NEUTRAL: EqualizerRecommendation = {
  label: "Equilibrado",
  reason:
    "O Spotify não informou um gênero para este artista. A sugestão começa neutra; ajuste conforme sua preferência e seus fones.",
  equalizer: { bass: 0, mids: 0, treble: 0 },
};

const PRESETS: {
  match: string[];
  label: string;
  reason: string;
  equalizer: Equalizer;
}[] = [
  {
    match: ["classical", "orchestra", "soundtrack"],
    label: "Clássico",
    reason:
      "Sugestão leve para preservar detalhes e equilíbrio em gravações orquestrais.",
    equalizer: { bass: 0, mids: 1, treble: 2 },
  },
  {
    match: ["jazz", "blues"],
    label: "Jazz & blues",
    reason:
      "Sugestão moderada para dar presença a instrumentos e manter os graves controlados.",
    equalizer: { bass: 1, mids: 2, treble: 1 },
  },
  {
    match: ["rock", "metal", "punk", "grunge", "alternative"],
    label: "Rock",
    reason:
      "Sugestão de presença nos médios, com reforço discreto de graves e agudos.",
    equalizer: { bass: 2, mids: 1, treble: 1 },
  },
  {
    match: ["hip hop", "hip-hop", "rap", "trap", "reggaeton", "funk"],
    label: "Hip-hop & beats",
    reason:
      "Sugestão com graves mais presentes, sem exagerar nas outras faixas.",
    equalizer: { bass: 3, mids: 0, treble: 1 },
  },
  {
    match: ["electronic", "edm", "dance", "house", "techno", "trance"],
    label: "Eletrônica",
    reason:
      "Sugestão com reforço de graves e brilho moderado para música eletrônica.",
    equalizer: { bass: 2, mids: 0, treble: 2 },
  },
  {
    match: ["acoustic", "folk", "singer-songwriter", "indie folk"],
    label: "Acústico",
    reason:
      "Sugestão suave para priorizar vozes e detalhes sem reforçar demais os graves.",
    equalizer: { bass: 0, mids: 2, treble: 1 },
  },
  {
    match: ["r&b", "soul", "neo soul"],
    label: "R&B & soul",
    reason:
      "Sugestão equilibrada com leve presença nos graves e na região vocal.",
    equalizer: { bass: 2, mids: 1, treble: 0 },
  },
  {
    match: ["pop", "k-pop", "indie pop"],
    label: "Pop",
    reason:
      "Sugestão geral com reforço discreto de graves e agudos.",
    equalizer: { bass: 1, mids: 0, treble: 1 },
  },
];

export function recommendEqualizer(genres: string[]): EqualizerRecommendation {
  const normalizedGenres = genres.map((genre) => genre.toLowerCase());

  for (const preset of PRESETS) {
    if (
      normalizedGenres.some((genre) =>
        preset.match.some((tag) => genre.includes(tag)),
      )
    ) {
      return {
        label: preset.label,
        reason: `${preset.reason} Baseada no gênero informado para o artista, não em análise direta do áudio.`,
        equalizer: { ...preset.equalizer },
      };
    }
  }

  return {
    ...NEUTRAL,
    equalizer: { ...NEUTRAL.equalizer },
  };
}
