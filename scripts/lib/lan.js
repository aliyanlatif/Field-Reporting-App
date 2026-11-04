const os = require('node:os');

const PRIVATE = [/^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[01])\./];
const VIRTUAL =
  /docker|veth|br-|vbox|vmnet|utun|bridge|vethernet|tailscale|zt/i;
const WIFI_FIRST = /^(en0|wlan|wl|wi-?fi)/i;

const isIPv4 = family => family === 'IPv4' || family === 4;

/** The machine's private IPv4 addresses, with Wi-Fi and Ethernet before virtual adapters. */
function lanAddresses(interfaces = os.networkInterfaces()) {
  const found = [];
  for (const [name, list] of Object.entries(interfaces)) {
    for (const entry of list ?? []) {
      if (
        isIPv4(entry.family) &&
        !entry.internal &&
        PRIVATE.some(pattern => pattern.test(entry.address))
      ) {
        found.push({ name, address: entry.address });
      }
    }
  }
  const rank = ({ name }) =>
    VIRTUAL.test(name) ? 2 : WIFI_FIRST.test(name) ? 0 : 1;
  return found.sort((a, b) => rank(a) - rank(b));
}

const pickLanAddress = interfaces =>
  lanAddresses(interfaces)[0]?.address ?? null;

module.exports = { lanAddresses, pickLanAddress };
