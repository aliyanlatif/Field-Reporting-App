#!/usr/bin/env node
/**
 * Builds a standalone debug app that reaches the server over Wi-Fi instead of the adb tunnel, with its JavaScript baked in,
 * so airplane mode cannot cut it off from the server and it can cold-start with no Metro.
 */
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { adb, connectedDevices } = require('./lib/adb');
const { lanAddresses, pickLanAddress } = require('./lib/lan');

const root = path.join(__dirname, '..');
const addressFile = path.join(root, 'src', 'config', 'serverAddress.ts');
const SERVER_PORT = process.env.SERVER_PORT ?? '4000';
const isWindows = process.platform === 'win32';

function fail(message) {
  console.error(`\n${message}`);
  process.exit(1);
}

function run(command, args, cwd = root, env = process.env) {
  const result = spawnSync(command, args, {
    cwd,
    env,
    stdio: 'inherit',
    shell: isWindows,
  });
  if (result.status !== 0) {
    fail(`"${command} ${args.join(' ')}" failed.`);
  }
}

function serverIsUp(url) {
  return new Promise(resolve => {
    const request = http.get(`${url}/health`, { timeout: 2000 }, response => {
      response.resume();
      resolve(response.statusCode === 200);
    });
    request.on('timeout', () => request.destroy());
    request.on('error', () => resolve(false));
  });
}

function cleanBundleFiles() {
  spawnSync(
    'git',
    [
      'clean',
      '-fdq',
      '--',
      'android/app/src/main/assets/index.android.bundle',
      'android/app/src/main/res/drawable-mdpi',
      'android/app/src/main/res/drawable-hdpi',
      'android/app/src/main/res/drawable-xhdpi',
      'android/app/src/main/res/drawable-xxhdpi',
      'android/app/src/main/res/drawable-xxxhdpi',
      'android/app/src/main/res/raw',
    ],
    { cwd: root, stdio: 'ignore' },
  );
}

async function main() {
  const host = process.env.SERVER_HOST ?? pickLanAddress();
  if (!host) {
    fail(
      "Could not find this machine's Wi-Fi address. Connect to a network, or set it yourself: SERVER_HOST=192.168.x.x npm run android:airplane",
    );
  }
  const serverUrl = `http://${host}:${SERVER_PORT}`;

  const devices = connectedDevices();
  if (devices.length === 0) {
    fail('No Android device or emulator is connected (check `adb devices`).');
  }

  console.log(`Server address baked into the app: ${serverUrl}`);
  const others = lanAddresses()
    .map(entry => entry.address)
    .filter(address => address !== host);
  if (others.length > 0 && !process.env.SERVER_HOST) {
    console.log(
      `(Other addresses found: ${others.join(
        ', ',
      )}. Use SERVER_HOST=... to pick one.)`,
    );
  }
  if (!(await serverIsUp(serverUrl))) {
    console.warn(
      `\nWarning: nothing answers at ${serverUrl} yet. Start the server in another terminal: cd server && npm start\n(If it is running, allow Node through the firewall and check the phone is on the same Wi-Fi.)\n`,
    );
  }

  const original = fs.readFileSync(addressFile, 'utf8');
  const restore = () => fs.writeFileSync(addressFile, original);
  process.on('SIGINT', () => {
    restore();
    process.exit(130);
  });

  try {
    fs.writeFileSync(
      addressFile,
      `${original
        .split('\n')
        .filter(line => !line.startsWith('export const'))
        .join('\n')}export const SERVER_ADDRESS = '${serverUrl}';\n`,
    );
    run('npx', [
      'react-native',
      'bundle',
      '--platform',
      'android',
      '--dev',
      'false',
      '--entry-file',
      'index.js',
      '--bundle-output',
      'android/app/src/main/assets/index.android.bundle',
      '--assets-dest',
      'android/app/src/main/res',
    ]);
  } finally {
    restore();
  }

  try {
    const gradle = isWindows ? 'gradlew.bat' : './gradlew';
    for (const serial of devices) {
      console.log(`\nInstalling on ${serial}...`);
      run(gradle, ['app:installDebug'], path.join(root, 'android'), {
        ...process.env,
        ANDROID_SERIAL: serial,
      });
      adb([
        '-s',
        serial,
        'shell',
        'am',
        'start',
        '-n',
        'com.fieldreports/.MainActivity',
      ]);
    }
  } finally {
    cleanBundleFiles();
  }

  console.log(`
Done. The app is installed and running with the server at ${serverUrl}.

Try it:
  npm run airplane:on        file a few reports, force-quit and reopen the app
  npm run airplane:off       they upload by themselves
(on a phone, switching airplane mode on the phone itself works too)
`);
}

main();
