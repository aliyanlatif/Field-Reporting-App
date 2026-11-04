import os from 'node:os';

const PRIVATE = [/^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[01])\./];
const VIRTUAL =
  /docker|veth|br-|vbox|vmnet|utun|bridge|vethernet|tailscale|zt/i;
const WIFI_FIRST = /^(en0|wlan|wl|wi-?fi)/i;

/** The machine's private IPv4 addresses, with Wi-Fi and Ethernet before virtual adapters. */
export function lanAddresses() {
  const rank = (name: string) =>
    VIRTUAL.test(name) ? 2 : WIFI_FIRST.test(name) ? 0 : 1;
  return Object.entries(os.networkInterfaces())
    .flatMap(([name, list]) =>
      (list ?? [])
        .filter(
          entry =>
            entry.family === 'IPv4' &&
            !entry.internal &&
            PRIVATE.some(pattern => pattern.test(entry.address)),
        )
        .map(entry => ({ name, address: entry.address })),
    )
    .sort((a, b) => rank(a.name) - rank(b.name))
    .map(entry => entry.address);
}
