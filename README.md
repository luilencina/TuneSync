# TuneSync

The app connects to Spotify to display the current track and give a genre-based
equalizer recommendation. TuneSync never contains a Spotify Client ID or
Client Secret; enter the public Client ID in the app when connecting.

## Production deployment

The `main` branch GitHub Actions workflow builds the app and publishes `dist/`
to GitHub Pages. Push the changes to `main` to replace the currently published
version.

## Run locally

Run the prototype locally with:

```sh
npm install
npm run dev
```

The app asks for a Spotify Client ID and uses the Spotify API to display
currently playing track metadata and genre-based EQ suggestions. The Client ID
is not checked into source code. For local OAuth testing, add
`http://localhost:5173/` as a Redirect URI in the Spotify Developer Dashboard.

The suggestions are estimates, not audio analysis, and cannot change Spotify's
audio. Adjustments must be made manually in Spotify.

## Capacitor and Bluetooth LE

Install dependencies and synchronize the web app and native plugins:

```sh
npm install
npm run build
npm run cap:sync
```

Open the native projects with Android Studio or Xcode:

```sh
npm run cap:open:android
npm run cap:open:ios
```

The Bluetooth BLE tab scans for nearby Bluetooth Low Energy devices, connects
to a selected device, and saves its discovered services and characteristic
properties on the current device. It does not support Bluetooth Classic or
change a car stereo's equalizer. Android and iOS BLE should be tested on
physical devices; iOS builds require macOS and Xcode. In the browser, BLE
availability depends on Web Bluetooth support and a secure context (HTTPS or
localhost).

## Checks

```sh
npm run typecheck
npm run build
```

## Source organization

- `src/pages/` composes the application page and coordinates UI state.
- `src/components/` contains focused, presentational interface components.
- `src/schemas/` defines the Spotify API, track, token, and equalizer data types.
- `src/services/` handles Spotify authorization/API requests and EQ recommendations.
- `src/theme/` contains the Tailwind design tokens.
- `src/utils/` contains small shared formatting helpers.
