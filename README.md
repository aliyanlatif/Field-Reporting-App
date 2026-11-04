# Field Reports

A React Native app for field inspectors to create reports with a description and 1–5 photos. Reports are saved on the device first and uploaded automatically when a network connection is available.

## Requirements

- Node.js 22 (`nvm use` reads the version from `.nvmrc`)
- Android SDK
- Android emulator or a physical Android device

Android is the supported and tested platform. iOS is not configured.

## Setup

Install the project and backend dependencies:

```bash
nvm use
npm install
cd server && npm install
```

## Run the app

Start the backend in one terminal:

```bash
cd server
npm start
```

Start Metro in a second terminal:

```bash
npm start
```

Run the Android app in a third terminal:

```bash
npm run android
```

The default Android setup uses ADB to forward the backend connection to the device. No server IP configuration is normally required. Keep the app running as a debug build when using the local HTTP backend.

## Test offline report delivery

Use this flow to check that reports are saved locally while offline and uploaded when the connection returns.

1. Start the backend:

   ```bash
   cd server
   npm start
   ```

2. Build and install the airplane-mode version:

   ```bash
   npm run android:airplane
   ```

3. Turn airplane mode on:

   ```bash
   npm run airplane:on
   ```

4. Create a few reports, including one with five photos. Force-quit and reopen the app while still offline.

5. Turn airplane mode off:

   ```bash
   npm run airplane:off
   ```

Reports should upload automatically. Their status changes from **Waiting for network** to **Uploaded**.

**Note:** The phone and computer must be connected to the same Wi-Fi network for this test. The airplane-mode build connects to the backend over Wi-Fi and includes its JavaScript bundle, so Metro is not required. If automatic server-address detection selects the wrong network adapter, provide the address manually:

```bash
SERVER_HOST=192.168.x.x npm run android:airplane
```

For a phone connected through wireless ADB, turn airplane mode off directly on the phone if the ADB command cannot reach it.

## Test server failures

The backend includes commands for simulating network and server failures. Run these from the `server` directory:

```bash
npm run chaos -- status
npm run chaos -- off
npm run chaos -- latency=3000
npm run chaos -- drop=0.3
npm run chaos -- lose-response=0.3
npm run chaos -- error=0.3
npm run chaos -- refuse-uploads=true
npm run chaos -- hang=true
npm run chaos -- drop-upload-after=300000
```

These settings simulate delayed requests, dropped connections, lost responses, server errors, refused image uploads, and requests that never respond. They can be changed while the server is running; a restart is not required.

A lost response is particularly important to test: the server may have saved a report even though the app did not receive confirmation. Retrying must not create a duplicate.

Reset the failure settings with:

```bash
npm run chaos -- off
```

## How report delivery works

- **Save locally first:** A report must have a non-blank description and 1–5 photos. The report and its image records are saved to SQLite before upload begins.
- **Upload safely:** Each report has a client-generated ID. The server uses it to recognize repeated requests. Images are uploaded individually, and the report is marked complete only after the server confirms that all images have arrived.
- **Recover after interruption:** Delivery progress is stored in SQLite. If the app is force-quit during an upload, it resumes from the last confirmed step when delivery runs again.
- **Retry temporary failures:** Network errors, timeouts, and selected server responses are retried with exponential backoff. Permanent client errors are marked as failed and require the user to retry after addressing the issue.
- **Keep local photos until completion:** Photo files are deleted only after the server confirms that the report is complete.

Delivery is triggered when a report is saved, the app launches or returns to the foreground, the network reconnects, and a retry is due.

## Image handling

Photos are compressed before being stored and uploaded:

- The longest image edge is limited to 2048 pixels.
- JPEG quality is reduced, and resolution is lowered if needed, to keep each image under the 5 MB limit.
- The app does not queue an image if it cannot meet the size limit.
- The backend also rejects images over 5 MB.

## Reset options

The app provides two reset options:

- **Clear unsent reports:** Removes reports that are still waiting on the device, along with their photos.
- **Clear everything:** Deletes server reports and clears the local queue and stored photos.

For a full reset, the server is cleared first. If the server cannot be reached, local data is left untouched.

## Project structure

```text
server/                  Express backend and failure-injection commands
src/
  features/delivery/     Upload queue, retries, recovery and reset logic
  features/compose/      Report validation and submission
  features/reports/      Report status and list handling
  db/                    SQLite schema and repository
  services/               API, image, network and permission services
  stores/                 Zustand UI state
  screens/                App screens
  components/             Shared UI components
  hooks/                  Reusable hooks
  theme/                  App styling
```

The delivery logic is separate from the React UI. SQLite is the source of truth for queued reports; Zustand is used for UI state.

## Tests

Run the automated tests:

```bash
npm test
```

Run linting and TypeScript checks:

```bash
npm run lint
npx tsc --noEmit
```

The tests cover retry behavior, duplicate-safe resubmission, recovery after interrupted uploads, image upload progress, reset ordering, and report validation.

## Known limitations

- **Background delivery:** Uploads run while the app is active. If the app is backgrounded or closed, delivery resumes when it returns to the foreground. A native Android background job would be needed for reliable delivery while the app is closed.
- **Platform testing:** The app was tested on an Android emulator and on a physical android device but not on a real 2G connection. Slow and unreliable network behavior was simulated using the backend failure-injection commands.
- **Server persistence:** Report data is held in memory by the backend, while image files are stored under `server/data/`. Restarting the server clears its report records.
- **iOS:** Not configured or tested.

## If I had more time

- Move delivery into an Android background job so uploads can continue when the app is closed.
- Test accessibility, including screen-reader support and larger text sizes.
