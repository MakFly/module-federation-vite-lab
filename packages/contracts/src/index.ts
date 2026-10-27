import type { QueryClient } from '@tanstack/react-query';
import type { RouteObject } from 'react-router';

export type * from './http.ts';
export type * from './api.ts';
export type * from './bff.ts';

// Shell -> catalog remote contract (Module Federation, one exposed module: `catalog/routes`).
// The remote owns its pages: it hands the shell a route tree, and the shell mounts it under a
// `:country` route. Every remote route reads `params.country`; nothing else is passed down.
export type CatalogRoutesDeps = { queryClient: QueryClient };
export type CreateCatalogRoutes = (deps: CatalogRoutesDeps) => RouteObject[];

// Set as `handle` on page routes, read by the shell through `useMatches()`:
// which deployment renders the current page.
export type MfeHandle = { mfe: 'shell' | 'catalog'; page: string };

// What the shell's bag action (POST `paths.bag(country)`) answers to a fetcher.
// The form fields are a `CartAction` from @acme/bff-client.
export type BagActionResult = { ok: true } | { ok: false; error: string };
