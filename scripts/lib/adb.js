const { spawnSync } = require('node:child_process');
const path = require('node:path');

const sdkRoot = process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT;
const adbBinary = sdkRoot ? path.join(sdkRoot, 'platform-tools', 'adb') : 'adb';

function adb(args) {
  const result = spawnSync(adbBinary, args, { encoding: 'utf8' });
  if (result.error) {
    throw new Error(
      `Could not run adb (${
        result.error.code ?? result.error.message
      }). Install the Android SDK platform-tools or set ANDROID_HOME.`,
    );
  }
  return {
    ok: result.status === 0,
    output: `${result.stdout}${result.stderr}`.trim(),
  };
}

/** Serial numbers of every connected emulator or phone that is ready to use. */
function parseDevices(output) {
  return output
    .split('\n')
    .slice(1)
    .map(line => line.trim().split(/\s+/))
    .filter(([, state]) => state === 'device')
    .map(([serial]) => serial);
}

const connectedDevices = () => parseDevices(adb(['devices']).output);

module.exports = { adb, connectedDevices, parseDevices };
