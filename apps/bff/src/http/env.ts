import { createFactory } from 'hono/factory';
import type { RequestIdVariables } from 'hono/request-id';
import type { CatalogApiClient } from '../clients/catalog-api.client.ts';
import type { Session } from '../session/session.store.ts';

export type AppEnv = {
  Variables: RequestIdVariables & {
    session: Session;
    api: CatalogApiClient;
  };
};

export const factory = createFactory<AppEnv>();
