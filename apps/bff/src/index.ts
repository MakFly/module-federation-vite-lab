import { createApp } from './app.ts';
import { config } from './config.ts';

console.log(`BFF prêt sur http://localhost:${config.port} (API : ${config.apiUrl})`);

export default { port: config.port, fetch: createApp({ config }).fetch };
