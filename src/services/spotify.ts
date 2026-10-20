import type {
  SpotifyApiErrorBody,
  SpotifyArtistResponse,
  SpotifyAuthorizationResult,
  SpotifyPlayingResponse,
  SpotifyToken,
  SpotifyTokenResponse,
  SpotifyTrack,
} from "../schemas/spotify";

const CLIENT_ID_KEY = "tunesync-spotify-client-id";
const TOKEN_KEY = "tunesync-spotify-token";
const OAUTH_STATE_KEY = "tunesync-spotify-oauth-state";
const CODE_VERIFIER_KEY = "tunesync-spotify-code-verifier";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const API_ENDPOINT = "https://api.spotify.com/v1";

const genreCache = new Map<string, string[]>();

function getRedirectUri() {
  return `${window.location.origin}${window.location.pathname}`;
}

function encodeBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function createRandomToken(byteLength: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return encodeBase64Url(bytes);
}

function loadStoredToken(): SpotifyToken | null {
  const stored = localStorage.getItem(TOKEN_KEY);
  if (!stored) return null;

  try {
    const token: unknown = JSON.parse(stored);
    if (
      typeof token === "object" &&
      token !== null &&
      "accessToken" in token &&
      typeof token.accessToken === "string" &&
      "expiresAt" in token &&
      typeof token.expiresAt === "number" &&
      "refreshToken" in token &&
      (typeof token.refreshToken === "string" || token.refreshToken === null)
    ) {
      return token as SpotifyToken;
    }
  } catch {
    localStorage.removeItem(TOKEN_KEY);
  }

  return null;
}

function saveToken(token: SpotifyToken) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
}

function toStoredToken(
  response: SpotifyTokenResponse,
  previous?: SpotifyToken,
): SpotifyToken {
  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token ?? previous?.refreshToken ?? null,
    expiresAt: Date.now() + response.expires_in * 1000,
  };
}

async function parseSpotifyError(response: Response) {
  let message = `O Spotify respondeu com erro (${response.status}).`;

  try {
    const body = (await response.json()) as SpotifyApiErrorBody;
    const detail =
      typeof body.error === "string"
        ? body.error
        : body.error?.message;
    if (detail) message = detail;
  } catch {
    if (response.statusText) message = response.statusText;
  }

  if (response.status === 401) {
    return "A autorização do Spotify expirou. Desconecte e conecte novamente.";
  }
  if (response.status === 403) {
    return "O Spotify negou o acesso. Confira as permissões e o modo de desenvolvimento do seu app.";
  }
  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    return `Limite de consultas do Spotify atingido.${retryAfter ? ` Tente novamente em ${retryAfter} segundos.` : ""}`;
  }

  return message;
}

async function requestToken(body: URLSearchParams) {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error(await parseSpotifyError(response));
  }

  return (await response.json()) as SpotifyTokenResponse;
}

export function getSavedClientId() {
  return localStorage.getItem(CLIENT_ID_KEY) ?? "";
}

export function getSavedToken() {
  return loadStoredToken();
}

export async function connectSpotify(clientId: string) {
  if (!/^[a-zA-Z0-9]+$/.test(clientId)) {
    throw new Error("O Spotify Client ID deve conter apenas letras e números.");
  }

  localStorage.setItem(CLIENT_ID_KEY, clientId);
  const verifier = createRandomToken(64);
  const challengeBytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  const challenge = encodeBase64Url(new Uint8Array(challengeBytes));
  const state = createRandomToken(24);

  localStorage.setItem(CODE_VERIFIER_KEY, verifier);
  localStorage.setItem(OAUTH_STATE_KEY, state);

  const authorizationUrl = new URL(AUTH_ENDPOINT);
  authorizationUrl.search = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: getRedirectUri(),
    scope: "user-read-currently-playing",
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
  }).toString();

  window.location.assign(authorizationUrl);
}

export async function completeSpotifyAuthorization(): Promise<SpotifyAuthorizationResult | null> {
  const callbackUrl = new URL(window.location.href);
  const code = callbackUrl.searchParams.get("code");
  const returnedState = callbackUrl.searchParams.get("state");
  const authorizationError = callbackUrl.searchParams.get("error");

  if (!code && !authorizationError) return null;

  window.history.replaceState({}, document.title, getRedirectUri());

  if (authorizationError) {
    localStorage.removeItem(OAUTH_STATE_KEY);
    localStorage.removeItem(CODE_VERIFIER_KEY);
    throw new Error("A autorização do Spotify foi cancelada ou recusada.");
  }

  const expectedState = localStorage.getItem(OAUTH_STATE_KEY);
  const verifier = localStorage.getItem(CODE_VERIFIER_KEY);
  const clientId = getSavedClientId();

  localStorage.removeItem(OAUTH_STATE_KEY);
  localStorage.removeItem(CODE_VERIFIER_KEY);

  if (!expectedState || returnedState !== expectedState) {
    throw new Error("Não foi possível validar a resposta de autorização do Spotify.");
  }
  if (!verifier || !clientId) {
    throw new Error("A sessão de conexão expirou. Tente conectar ao Spotify novamente.");
  }

  const response = await requestToken(
    new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code: code ?? "",
      redirect_uri: getRedirectUri(),
      code_verifier: verifier,
    }),
  );
  const token = toStoredToken(response);
  saveToken(token);

  return { clientId, token };
}

async function refreshAccessToken(token: SpotifyToken): Promise<SpotifyToken> {
  const clientId = getSavedClientId();
  if (!token.refreshToken || !clientId) {
    throw new Error("Reconecte sua conta Spotify para continuar.");
  }

  const response = await requestToken(
    new URLSearchParams({
      client_id: clientId,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    }),
  );
  const refreshedToken = toStoredToken(response, token);
  saveToken(refreshedToken);
  return refreshedToken;
}

async function fetchWithSpotifyToken(
  url: string,
  token: SpotifyToken,
): Promise<{ response: Response; token: SpotifyToken }> {
  let activeToken = token;
  if (activeToken.expiresAt <= Date.now() + 30_000) {
    activeToken = await refreshAccessToken(activeToken);
  }

  let response = await fetch(url, {
    headers: { Authorization: `Bearer ${activeToken.accessToken}` },
  });

  if (response.status === 401 && activeToken.refreshToken) {
    activeToken = await refreshAccessToken(activeToken);
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${activeToken.accessToken}` },
    });
  }

  if (!response.ok && response.status !== 204) {
    throw new Error(await parseSpotifyError(response));
  }

  return { response, token: activeToken };
}

export async function getCurrentTrack(token: SpotifyToken): Promise<SpotifyTrack | null> {
  const { response, token: activeToken } = await fetchWithSpotifyToken(
    `${API_ENDPOINT}/me/player/currently-playing`,
    token,
  );

  if (activeToken !== token) saveToken(activeToken);
  if (response.status === 204) return null;

  const playing = (await response.json()) as SpotifyPlayingResponse;
  if (!playing.item) return null;

  const primaryArtist = playing.item.artists[0];
  let genres: string[] = [];
  let genreWarning: string | null = null;

  if (primaryArtist?.id) {
    const cachedGenres = genreCache.get(primaryArtist.id);
    if (cachedGenres) {
      genres = cachedGenres;
    } else {
      try {
        const artistResult = await fetchWithSpotifyToken(
          `${API_ENDPOINT}/artists/${encodeURIComponent(primaryArtist.id)}`,
          activeToken,
        );
        const artist = (await artistResult.response.json()) as SpotifyArtistResponse;
        genres = artist.genres ?? [];
        genreCache.set(primaryArtist.id, genres);
        if (artistResult.token !== activeToken) saveToken(artistResult.token);
      } catch (artistError) {
        genreWarning =
          artistError instanceof Error
            ? artistError.message
            : "não foi possível consultar os gêneros.";
      }
    }
  }

  return {
    id: playing.item.id,
    name: playing.item.name,
    artist: playing.item.artists.map((artist) => artist.name).join(", "),
    album: playing.item.album.name,
    imageUrl: playing.item.album.images[0]?.url ?? null,
    spotifyUrl: playing.item.external_urls?.spotify ?? null,
    isPlaying: playing.is_playing,
    progressMs: playing.progress_ms,
    durationMs: playing.item.duration_ms,
    genres,
    genreWarning,
  };
}

export function getUpdatedToken(previous: SpotifyToken) {
  const current = loadStoredToken();
  return current?.accessToken !== previous.accessToken ? current : previous;
}

export function disconnectSpotify() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(OAUTH_STATE_KEY);
  localStorage.removeItem(CODE_VERIFIER_KEY);
}
