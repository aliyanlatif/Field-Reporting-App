#!/usr/bin/env node
const { adb, connectedDevices } = require('./lib/adb');

const mode = process.argv[2];
if (mode !== 'on' && mode !== 'off') {
  console.error('Usage: npm run airplane:on | npm run airplane:off');
  process.exit(1);
}

const devices = connectedDevices();
if (devices.length === 0) {
  console.error(
    'No Android device or emulator is connected (check `adb devices`).',
  );
  process.exit(1);
}

let failed = false;
for (const serial of devices) {
  const { ok, output } = adb([
    '-s',
    serial,
    'shell',
    'cmd',
    'connectivity',
    'airplane-mode',
    mode === 'on' ? 'enable' : 'disable',
  ]);
  if (ok && !/error|exception/i.test(output)) {
    console.log(`${serial}: airplane mode ${mode}`);
  } else {
    failed = true;
    console.error(
      `${serial}: could not switch airplane mode (${output || 'no output'}).`,
    );
    console.error('  Switch it by hand in the quick settings instead.');
  }
}
if (mode === 'on') {
  console.log(
    'Note: a phone connected over wireless adb drops off adb in airplane mode. Use a USB cable or an emulator to turn it off from here, or switch it off on the phone.',
  );
}
process.exit(failed ? 1 : 0);
