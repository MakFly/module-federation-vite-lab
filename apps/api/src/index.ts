import { createApp } from './app.ts';

const port = Number(process.env.PORT ?? 3002);

console.log(`API (DDD) prête sur http://localhost:${port}`);

export default { port, fetch: createApp().fetch };
