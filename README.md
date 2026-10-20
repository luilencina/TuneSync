# TuneSync

The public GitHub Pages build intentionally does not include Spotify
credentials, Spotify API integration, recommendations, or equalizer controls.
Those features are available only while running the development server.

## Production deployment

The `main` branch GitHub Actions workflow builds the app and publishes `dist/`
to GitHub Pages. Push the changes to `main` to replace the currently published
version.

## Development-only Spotify prototype

Run the prototype locally with:

```sh
npm install
npm run dev
```

The development screen asks for a Spotify Client ID and uses the Spotify API
to display currently playing track metadata and genre-based EQ suggestions.
The Client ID is not checked into source code. For local OAuth testing, add
`http://localhost:5173/` as a Redirect URI in the Spotify Developer Dashboard.

The suggestions are estimates, not audio analysis, and cannot change Spotify's
audio. Adjustments must be made manually in Spotify.

## Checks

```sh
npm run typecheck
npm run build
```
