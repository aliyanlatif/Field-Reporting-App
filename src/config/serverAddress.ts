// By default the dev server forwards this port to every adb-connected device, so one address works on emulators and phones.
// `npm run android:airplane` swaps in the laptop's Wi-Fi address for the build, then restores this line.
export const SERVER_ADDRESS = 'http://localhost:4000';
