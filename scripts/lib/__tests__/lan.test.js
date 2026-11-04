const { lanAddresses, pickLanAddress } = require('../lan');
const { parseDevices } = require('../adb');

const entry = (address, overrides = {}) => ({
  address,
  family: 'IPv4',
  internal: false,
  ...overrides,
});

describe('pickLanAddress', () => {
  test('prefers the Wi-Fi adapter over virtual ones', () => {
    expect(
      pickLanAddress({
        docker0: [entry('172.17.0.1')],
        en0: [entry('192.168.1.3')],
        utun3: [entry('10.8.0.2')],
      }),
    ).toBe('192.168.1.3');
  });

  test('skips loopback, public addresses and IPv6', () => {
    expect(
      pickLanAddress({
        lo0: [entry('127.0.0.1', { internal: true })],
        en1: [entry('8.8.8.8'), entry('fe80::1', { family: 'IPv6' })],
      }),
    ).toBeNull();
  });

  test('accepts 10.x and 172.16-31 networks and returns null when there is none', () => {
    expect(pickLanAddress({ eth0: [entry('10.0.0.7')] })).toBe('10.0.0.7');
    expect(pickLanAddress({ eth0: [entry('172.20.1.4')] })).toBe('172.20.1.4');
    expect(pickLanAddress({})).toBeNull();
  });

  test('lists every candidate in order of preference', () => {
    expect(
      lanAddresses({
        eth0: [entry('10.0.0.7')],
        wlan0: [entry('192.168.4.20')],
      }).map(item => item.address),
    ).toEqual(['192.168.4.20', '10.0.0.7']);
  });
});

describe('parseDevices', () => {
  test('keeps only devices that are ready', () => {
    const output = [
      'List of devices attached',
      'emulator-5554\tdevice',
      '192.168.1.13:39081\tdevice',
      'ABC123\toffline',
      'XYZ789\tunauthorized',
      '',
    ].join('\n');

    expect(parseDevices(output)).toEqual([
      'emulator-5554',
      '192.168.1.13:39081',
    ]);
  });

  test('is empty when nothing is connected', () => {
    expect(parseDevices('List of devices attached\n\n')).toEqual([]);
  });
});
