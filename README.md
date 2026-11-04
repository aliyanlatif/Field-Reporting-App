# Field Reports

A React Native app for a field inspector who files photo reports (a short description and 1–5 photos) over a 2G connection that often drops. A report is saved on the device first, then delivered to the server unattended, exactly once, whatever the network does.

- React Native CLI 0.88 (not Expo), React 19, TypeScript in strict mode
- Android is the supported target. iOS was not set up or tested.
- A small Express backend in [server/](server/) with runtime failure injection

## Run it

**Requirements:** Node 22 (`nvm use` reads [.nvmrc](.nvmrc)), the Android SDK, and an emulator or a device with USB or wireless debugging.

```sh
nvm use
npm install
(cd server && npm install)
```

**1. Start the backend** (port 4000):

```sh
cd server
npm start
```

**2. Point the app at it.** Edit `API_BASE_URL` in [src/config/index.ts](src/config/index.ts):

| Where the app runs | Value |
|---|---|
| Android emulator | `http://10.0.2.2:4000` (the default) |
| Physical phone | `http://<your laptop's LAN IP>:4000`, phone and laptop on the same network |

**3. Start Metro and run the app:**

```sh
npm start            # Metro
npm run android      # in another terminal
```

On a physical device over USB also run `adb reverse tcp:8081 tcp:8081`.

Cleartext HTTP is allowed in **debug builds only** (Android blocks it in release builds by default), so run the app as a debug build against the local server.

**Tests:** `npm test` runs 96 Jest tests with no UI and no device. `npm run lint` and `npx tsc --noEmit` should both be clean.

## Failure injection

The server can misbehave on demand, so every delivery path can be exercised by hand. Settings change at runtime, no restart needed:

```sh
cd server
npm run chaos -- status                      # show current settings
npm run chaos -- off                         # back to normal
npm run chaos -- latency=3000                # delay every /reports request by 3 s
npm run chaos -- drop=0.3                    # kill the connection on 30% of requests
npm run chaos -- lose-response=0.3           # handle the request, then drop the response
npm run chaos -- error=0.3                   # answer 503 on 30% of requests
npm run chaos -- refuse-uploads=true         # answer 403 to image uploads (not retriable)
npm run chaos -- hang=true                   # never answer /reports requests
npm run chaos -- drop-upload-after=300000    # cut an image upload after 300 KB
```

The same settings can be given at startup as environment variables, for example `CHAOS_ERROR_RATE=0.3 npm start`. The names are `CHAOS_LATENCY_MS`, `CHAOS_DROP_RATE`, `CHAOS_LOSE_RESPONSE_RATE`, `CHAOS_ERROR_RATE`, `CHAOS_REFUSE_UPLOADS=1`, `CHAOS_HANG=1` and `CHAOS_DROP_UPLOAD_AFTER_BYTES`. The settings can also be changed with `GET`, `POST` and `DELETE` on `/chaos`. `/health` is never affected.

`lose-response` is the one that matters most for correctness: the server stores the data but the client never hears back, which is exactly the case where a naive retry would create a duplicate.

## How delivery works

1. **Save first.** Submitting validates the report (non-blank description, 1–5 photos), then writes the report and its image rows to SQLite in one transaction. The UI says "Saved on device", never "uploaded". Nothing waits on the network.
2. **A queue worker delivers it.** For each due report it calls three idempotent endpoints:
   - `POST /reports` with a client-generated id. A repeat of the same id returns the existing report, so a lost response is safe to retry.
   - `PUT /reports/:id/images/:imageId` for every image not yet confirmed. Storing the same image twice changes nothing.
   - `POST /reports/:id/complete`. The server checks that every declared image arrived (409 with the missing ids otherwise). A report only appears in `GET /reports` after this.
3. **Every state change is written to SQLite before the next network call**, so a force-quit at any point resumes from the last confirmed step. On launch anything stuck in `uploading` goes back to `queued`, and only the images the server has not confirmed are sent again.
4. **Local photo files are deleted only after the server confirms the report is complete.**

When delivery runs: at launch, when the app returns to the foreground, when the network comes back, right after a report is saved, and when a retry timer fires. A single-flight guard means these can overlap safely.

### Which failures are retried

| Failure | What the app does |
|---|---|
| No network, dropped connection, timeout | Retry with exponential backoff and jitter (2 s doubling to a 1 minute cap) |
| 5xx, 429, 408 | Same, honouring a longer `Retry-After` |
| 409 "images missing" or 404 "report not found" on complete | The server lost state, so retry (the next attempt re-creates the report and resends missing images) |
| Any other 4xx (400, 403, 413, id conflict) | Stop. Mark the report **Failed** with the reason and show a **Retry sending** button. Not retried automatically. |
| A photo file missing on the device | Same as above: failed, not retried forever |

Transient failures are retried without limit, because delivery has to be unattended. Every request has a timeout, so a server that hangs cannot block the queue.

## Images

- A camera original (an 18 MB file is normal) is resized so its longest edge is at most 2048 px, at JPEG quality 0.85, by `react-native-compressor`, which runs natively off the JS thread.
- If the result is over 4.5 MB it lowers quality in steps, then resolution, and verifies the final size. If nothing fits it refuses the photo rather than queue it. The app never sends a file over 5 MB, and the server rejects one with 413 as a second line of defence.
- Only the compressed copy is stored, in the app's own documents folder. The picker's cached original is deleted once the copy is safe.
- Tested with a 72 MB, 8000×6000 JPEG (about 0.9 s on the emulator, 887 KB out) and with 17 MB originals.
- Camera permission has three states (granted, denied, blocked). Denied offers "Allow camera", blocked offers "Open Settings", and the permission is re-checked when the app returns to the foreground, so granting it in Settings works without a restart. The gallery needs no permission.

## Start over

Start over clears **this phone only**. The server is never touched. The sheet offers two scopes, and a one-second press-and-hold confirms either so it cannot happen by accident:

- **Clear unsent reports** deletes the reports still waiting on the phone, and their photos.
- **Clear everything on this device** also clears the cached server list and every stored photo. The list is fetched from the server again straight after.

The worker is paused while it runs and the reset waits for any delivery in progress, so nothing is sent mid-wipe.

## Fixing a refused photo

If the server refuses a photo (any non-retriable 4xx), the report stops and shows **Needs you**. The report's detail screen offers **Replace photo** and, when it has more than one photo, **Remove photo**. The server fixes a report's image list when it first sees the id, so the fixed report is queued under a new id (keeping its original time) and the old, never completed one stays invisible on the server.

## Design decisions

- **SQLite is the source of truth for the queue; Zustand holds UI state only.** The durable copy lives in `react-native-nitro-sqlite`. The Zustand store just caches what the screens show, refreshed whenever the queue changes.
- **The delivery logic has no React in it.** `src/features/delivery` takes the repository and the API as injected dependencies, so Jest runs it against a real SQLite engine and an in-memory fake server that follows the same idempotency rules, with scripted failures. No screen is involved.
- **The server's copy wins in the list.** The "On the server" section comes from `GET /reports`. A report only shows as local until the server holds it.
- **"Saved on device" and "Uploaded" never share a sentence.** Statuses are: Saved on device, Uploading 2 of 5, Waiting to retry (with the reason), Failed, Uploaded.
- **One design language.** `src/theme` holds the Soft palette, the five status tones, Manrope type scale, shadows and motion timings. Shared pieces live in `src/components` (sheet, toast, hold button, timeline, progress ring). Every animation goes through `utils/motion` and respects the system's reduce-motion setting.
- **Real upload progress.** The API client uploads with `XMLHttpRequest` when a progress callback is given (`fetch` cannot report upload progress); progress is memory only, the queue in SQLite stays the source of truth.
- **Responsive sizing.** `src/utils/responsiveUtils.ts` provides `width`, `height`, `designPx` and `ResponsiveScaling`. All spacing, sizes and type scale from them. Touch targets are at least 52 dp.
- **Fonts.** Manrope is bundled as static files in `android/app/src/main/assets/fonts/` (Android picks a weight by file name).

### Project structure

```
server/                    Express backend and failure injection
src/
  features/delivery/       queue worker, uploader, retry policy, recovery, reset, triggers (no React)
  features/compose/        draft validation and submit logic
  features/reports/        status labels, list merging, banner state
  db/                      SQLite schema, migrations, repository
  services/                api client, images, network, permissions, delivery runtime
  stores/                  Zustand UI state
  screens/                 ComposeReport, ReportsList, ReportDetail
  components/  hooks/  theme/  navigation/  config/  types/  utils/
```

## What was tested

Unit tests cover retry classification, backoff bounds, idempotent resubmission after a lost response, recovery of stuck uploads, resending only unfinished images, the reset ordering and validation rules.

On an Android emulator I ran the full scenario by hand: airplane mode, three reports (one with five 17 MB originals), force-quit twice, reopen, then network back with uploads cut mid-transfer and no input. All three reports arrived exactly once, with every image intact and under the cap. I also checked a force-quit in the middle of an upload (only the missing image was resent), a server that refuses uploads, a server that hangs, backgrounding with work outstanding, a sixth photo, zero photos, a blank description, camera permission denied then granted, and reset both offline and online.

## What was knowingly left out

- **True background delivery.** Delivery runs while the app is alive. When the app is backgrounded, JS timers do not fire, so nothing is sent until the app returns to the foreground. Moving the worker into an Android background job is the biggest gap.
- **iOS.** Not configured or tested.
- **Testing on a physical phone and a real 2G link.** Everything above ran on an emulator, and the emulator's network throttle does not slow traffic to the host machine, so slow uploads were simulated with injected server latency.
- **No login, push, comments, maps, video, or editing uploaded reports,** as the brief says.
- **Server storage is in memory** for report data (images are written to `server/data/`). Restarting the server forgets completed reports. The app recovers from that, because a missing report is simply created again.

## With another day

- Run the queue from an Android background job so delivery continues with the app closed.
- Detect a stalled upload from upload-progress events instead of a total timeout that scales with file size, and resume interrupted uploads in chunks, which matters most on a link that drops constantly.
- Persist the server's data and add an end-to-end test (for example Detox) that drives the airplane-mode scenario.
- Keep a half-written draft across a force-quit.
- An accessibility pass with a screen reader and a larger-font audit.
