export type SpotifyToken = {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number;
};

export type SpotifyTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
};

export type SpotifyApiErrorBody = {
  error?: { message?: string } | string;
};

export type SpotifyArtist = {
  id: string | null;
  name: string;
};

export type SpotifyPlayingResponse = {
  is_playing: boolean;
  progress_ms: number | null;
  item: {
    id: string | null;
    name: string;
    duration_ms: number;
    artists: SpotifyArtist[];
    album: {
      name: string;
      images: { url: string }[];
    };
    external_urls?: { spotify?: string };
  } | null;
};

export type SpotifyArtistResponse = {
  genres?: string[];
};

export type SpotifyTrack = {
  id: string | null;
  name: string;
  artist: string;
  album: string;
  imageUrl: string | null;
  spotifyUrl: string | null;
  isPlaying: boolean;
  progressMs: number | null;
  durationMs: number | null;
  genres: string[];
  genreWarning: string | null;
};

export type SpotifyAuthorizationResult = {
  clientId: string;
  token: SpotifyToken;
};
