export type Equalizer = {
  bass: number;
  mids: number;
  treble: number;
};

export const EQUALIZER_BANDS = [
  { key: "bass", label: "Graves" },
  { key: "mids", label: "Médios" },
  { key: "treble", label: "Agudos" },
] as const satisfies ReadonlyArray<{
  key: keyof Equalizer;
  label: string;
}>;

export type EqualizerRecommendation = {
  label: string;
  reason: string;
  equalizer: Equalizer;
};
