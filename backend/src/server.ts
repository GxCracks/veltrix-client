import { createServer } from 'node:http';
import { createApp } from './app.js';
import { loadConfig } from './config.js';

const config = loadConfig();
const server = createServer(createApp({ config }));

server.listen(config.port, '0.0.0.0', () => {
  console.log(`VELTRIX API listening on port ${config.port}`);
});
