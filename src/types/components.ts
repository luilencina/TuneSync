export type Equalizer = {
  bass: number;
  mids: number;
  treble: number;
};

export type TrackProfile = {
  id: string;
  title: string;
  artist: string;
  equalizer: Equalizer;
};

export const DEFAULT_EQUALIZER: Equalizer = {
  bass: 0,
  mids: 0,
  treble: 0,
};

export const STORAGE_KEY = "tunesync-track-profiles";
