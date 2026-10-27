import type { QueryClient } from '@tanstack/react-query';
import { createBrowserRouter, data, Navigate, type RouteObject } from 'react-router';
import type { MfeHandle } from '@acme/contracts';
import { paths } from '@acme/bff-client';
import { defaultCountry, isCountry } from './lib/countries';
import { createBagAction } from './routes/bag';
import { NotFound, PageError, PageSkeleton } from './routes/pages';
import { ShellLayout } from './routes/ShellLayout';

/**
 * The shell's route tree. It only lists what the shell owns: the layout, the country segment,
 * the bag action and the 404. The catalog's pages are not listed here: the remote hands them over
 * at runtime (`catalog/routes`) and they are patched under the `country` route on first need.
 */
export function createShellRouter(queryClient: QueryClient) {
  const routes: RouteObject[] = [
    {
      id: 'root',
      Component: ShellLayout,
      children: [
        { index: true, element: <Navigate to={paths.home(defaultCountry)} replace /> },
        {
          id: 'country',
          path: ':country',
          loader: ({ params }) => {
            if (!isCountry(params.country)) throw data('Pays inconnu', { status: 404 });
            return null;
          },
          HydrateFallback: PageSkeleton,
          ErrorBoundary: PageError,
          children: [
            // The bag is a flyout, not a page: a direct visit to /:country/sac goes to the store.
            { path: 'sac', action: createBagAction(queryClient), element: <Navigate to=".." replace /> },
            { path: '*', Component: NotFound, handle: { mfe: 'shell', page: 'NotFound' } satisfies MfeHandle },
          ],
        },
      ],
    },
  ];

  let catalogRoutes: Promise<RouteObject[]> | undefined;
  let catalogMounted = false;

  return createBrowserRouter(routes, {
    /**
     * Lazy route discovery. React Router calls this when a path might match routes it does not
     * know yet (here, any path under /:country). The first call loads the remote's route module
     * through Module Federation and patches it in; after that it returns at once.
     * If the remote is down, the import throws and PageError renders inside the layout; the
     * promise is dropped, so a later navigation tries again.
     */
    async patchRoutesOnNavigation({ patch }) {
      if (catalogMounted) return;
      catalogRoutes ??= import('catalog/routes').then(({ createCatalogRoutes }) => createCatalogRoutes({ queryClient }));
      try {
        patch('country', await catalogRoutes);
        catalogMounted = true;
      } catch (error) {
        catalogRoutes = undefined;
        throw error;
      }
    },
  });
}
