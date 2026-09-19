import { createServer } from 'node:http';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { getPool } from './db/pool.js';
import { RealtimeHub } from './realtime/ws.js';
import { PostgresStore } from './store/postgres.js';

const config = loadConfig();
const store = new PostgresStore(getPool());
const realtime = new RealtimeHub(store, config);
const server = createServer(createApp({ config, store, realtime }));
realtime.attach(server);

server.listen(config.port, '0.0.0.0', () => {
  console.log(`VELTRIX API listening on port ${config.port}`);
});
