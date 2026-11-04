import { execFile } from 'node:child_process';
import path from 'node:path';

const POLL_INTERVAL_MS = 3000;
const ADB_TIMEOUT_MS = 5000;

const sdkRoot = process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT;
const adbBinary = sdkRoot ? path.join(sdkRoot, 'platform-tools', 'adb') : 'adb';

const adb = (args: string[]) =>
  new Promise<string>((resolve, reject) => {
    execFile(adbBinary, args, { timeout: ADB_TIMEOUT_MS }, (error, stdout) =>
      error ? reject(error) : resolve(stdout),
    );
  });

async function connectedDevices() {
  const output = await adb(['devices']);
  return output
    .split('\n')
    .slice(1)
    .map(line => line.split('\t'))
    .filter(([, state]) => state?.trim() === 'device')
    .map(([serial]) => serial);
}

/**
 * Makes `localhost:<port>` on every adb-connected Android device (emulator, USB or wireless) reach this server,
 * and renews it when a device reconnects. Development convenience only: silent when adb is not installed.
 */
export function keepDevicesConnected(port: number) {
  const mapping = `tcp:${port}`;
  const ready = new Set<string>();
  let stopped = false;

  async function sync() {
    const serials = await connectedDevices();
    for (const serial of [...ready].filter(known => !serials.includes(known))) {
      ready.delete(serial);
    }
    for (const serial of serials) {
      const existing = await adb(['-s', serial, 'reverse', '--list']);
      if (!existing.includes(`${mapping} ${mapping}`)) {
        await adb(['-s', serial, 'reverse', mapping, mapping]);
        ready.delete(serial);
      }
      if (!ready.has(serial)) {
        ready.add(serial);
        console.log(
          `Android device ${serial}: localhost:${port} now reaches this server`,
        );
      }
    }
  }

  async function tick() {
    try {
      await sync();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        stopped = true;
        console.log(
          "adb not found: set API_BASE_URL in the app to this machine's address instead",
        );
      }
    }
    if (!stopped) {
      setTimeout(tick, POLL_INTERVAL_MS).unref();
    }
  }

  tick();
}
