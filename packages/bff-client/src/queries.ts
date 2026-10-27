import { keepPreviousData, QueryClient, queryOptions } from '@tanstack/react-query';
import type { CartView, CatalogPageView, ProductPageView } from '@acme/contracts';
import { bff, BffRequestError } from './client.ts';

export type CatalogFilters = { search?: string; category?: string };

// URL scheme shared by every frontend. The country is the first segment, like a store's
// regional site: it picks the catalog, the prices and the bag.
export const paths = {
  home: (country: string) => `/${country}`,
  category: (country: string, slug: string) => `/${country}/boutique/${slug}`,
  product: (country: string, id: string) => `/${country}/produit/${id}`,
  // The shell's bag action: remotes post a `CartAction` here with a fetcher.
  bag: (country: string) => `/${country}/sac`,
};

// Centralized cache keys: the shell and the remote share the same cache without knowing each other.
export const queryKeys = {
  catalog: (tenantId: string, filters: CatalogFilters) => ['catalog', tenantId, filters] as const,
  product: (tenantId: string, productId: string) => ['product', tenantId, productId] as const,
  cart: (tenantId: string) => ['cart', tenantId] as const,
};

const withTenant = (tenantId: string, extra: Record<string, string | undefined> = {}) => {
  const query = new URLSearchParams({ tenant: tenantId });
  for (const [key, value] of Object.entries(extra)) if (value) query.set(key, value);
  return `?${query}`;
};

// `category` is a slug; the BFF resolves it to the API's category name.
export const catalogPageQuery = (tenantId: string, filters: CatalogFilters = {}) =>
  queryOptions({
    queryKey: queryKeys.catalog(tenantId, filters),
    queryFn: ({ signal }) => bff.get<CatalogPageView>(`/catalog${withTenant(tenantId, filters)}`, signal),
    staleTime: 30_000,
    // During a new search, we keep the previous list on screen instead of an empty screen.
    placeholderData: keepPreviousData,
  });

export const productPageQuery = (tenantId: string, productId: string) =>
  queryOptions({
    queryKey: queryKeys.product(tenantId, productId),
    queryFn: ({ signal }) => bff.get<ProductPageView>(`/products/${encodeURIComponent(productId)}${withTenant(tenantId)}`, signal),
    staleTime: 30_000,
  });

export const cartQuery = (tenantId: string) =>
  queryOptions({
    queryKey: queryKeys.cart(tenantId),
    queryFn: ({ signal }) => bff.get<CartView>(`/cart${withTenant(tenantId)}`, signal),
  });

export type CartAction =
  | { type: 'add'; productId: string; finishId: string }
  | { type: 'remove'; lineId: string }
  | { type: 'clear' };

export const runCartAction = (tenantId: string, action: CartAction): Promise<CartView> => {
  const query = withTenant(tenantId);
  switch (action.type) {
    case 'add': return bff.post<CartView>(`/cart/items${query}`, { productId: action.productId, finishId: action.finishId, quantity: 1 });
    case 'remove': return bff.delete<CartView>(`/cart/items/${encodeURIComponent(action.lineId)}${query}`);
    case 'clear': return bff.delete<CartView>(`/cart${query}`);
  }
};

// Retry only when the BFF itself could not be reached (network, or a proxy page without our envelope).
// Any enveloped error is final for the browser: 4xx are business answers, and for 5xx the BFF has
// already retried the API. Retrying here too would multiply calls (3 browser x 3 BFF = 9 API hits).
const isBffUnreachable = (error: unknown) =>
  error instanceof BffRequestError && (error.code === 'NETWORK_ERROR' || error.code === 'INVALID_RESPONSE');

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => isBffUnreachable(error) && failureCount < 2,
      },
    },
  });
