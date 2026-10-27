import { createFactory } from 'hono/factory';
import type { RequestIdVariables } from 'hono/request-id';

export type AppEnv = { Variables: RequestIdVariables };

// Handlers are declared through this factory to keep the typing of `c.req.valid()`.
export const factory = createFactory<AppEnv>();
