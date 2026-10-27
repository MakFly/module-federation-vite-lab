import type { CreateCatalogRoutes, MfeHandle } from '@acme/contracts';
import { catalogPageQuery, productPageQuery } from '@acme/bff-client';
import { CatalogError, CatalogLayout } from './CatalogLayout';
import './catalog.css';

const page = (name: string): MfeHandle => ({ mfe: 'catalog', page: name });

/**
 * Exposed as `catalog/routes`. The remote owns its URLs below `/:country`, their data and their
 * errors; the shell only decides where the tree is mounted.
 * Loaders warm the shared TanStack Query cache before the page renders (no loading flash, the
 * previous page stays on screen); pages read it with useSuspenseQuery. Each page is its own chunk.
 */
export const createCatalogRoutes: CreateCatalogRoutes = ({ queryClient }) => [
  {
    id: 'catalog',
    Component: CatalogLayout,
    ErrorBoundary: CatalogError,
    children: [
      {
        index: true,
        handle: page('HomePage'),
        loader: ({ params }) => queryClient.ensureQueryData({ ...catalogPageQuery(params.country!), revalidateIfStale: true }),
        lazy: () => import('./pages/HomePage'),
      },
      {
        path: 'boutique/:slug',
        handle: page('CategoryPage'),
        loader: ({ params }) =>
          queryClient.ensureQueryData({ ...catalogPageQuery(params.country!, { category: params.slug }), revalidateIfStale: true }),
        lazy: () => import('./pages/CategoryPage'),
      },
      {
        path: 'produit/:id',
        handle: page('ProductPage'),
        loader: ({ params }) => queryClient.ensureQueryData({ ...productPageQuery(params.country!, params.id!), revalidateIfStale: true }),
        lazy: () => import('./pages/ProductPage'),
      },
    ],
  },
];
