import { createApp } from './app.js';
import { config } from './config.js';
import { keepDevicesConnected } from './devTunnel.js';
import { lanAddresses } from './lanAddress.js';

createApp().listen(config.port, '0.0.0.0', () => {
  console.log(`Field reports server listening on port ${config.port}`);
  const [wifi] = lanAddresses();
  if (wifi) {
    console.log(`On the same Wi-Fi: http://${wifi}:${config.port}`);
  }
  if (process.env.ADB_TUNNEL !== 'off') {
    keepDevicesConnected(config.port);
  }
});
