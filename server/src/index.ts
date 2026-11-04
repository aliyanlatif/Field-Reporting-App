import { createApp } from './app.js';
import { config } from './config.js';
import { keepDevicesConnected } from './devTunnel.js';

createApp().listen(config.port, '0.0.0.0', () => {
  console.log(`Field reports server listening on port ${config.port}`);
  if (process.env.ADB_TUNNEL !== 'off') {
    keepDevicesConnected(config.port);
  }
});
