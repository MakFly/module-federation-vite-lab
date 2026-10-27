import { useContext, type ReactNode } from 'react';
import { QueryClientContext, QueryClientProvider, useMutationState } from '@tanstack/react-query';
import { createQueryClient, queryKeys, type CartAction } from '@acme/bff-client';

let standaloneClient: ReturnType<typeof createQueryClient> | undefined;

// Exposed pages run under the host's QueryClient when there is one (shared cache);
// under a host without TanStack Query, the remote brings its own.
export function WithQueryClient({ children }: { children: ReactNode }) {
  const hostClient = useContext(QueryClientContext);
  // The remote's stylesheet is scoped to this attribute (see vite.config.ts): keep it classless.
  const scoped = <div data-mfe="catalog">{children}</div>;
  if (hostClient) return scoped;

  standaloneClient ??= createQueryClient();
  return <QueryClientProvider client={standaloneClient}>{scoped}</QueryClientProvider>;
}

// Read from the shared cache: which product (and finish) is the shell adding right now?
export function useAddingKeys(tenantId: string) {
  return new Set(
    useMutationState({
      filters: { mutationKey: queryKeys.cart(tenantId), status: 'pending' },
      select: (mutation) => mutation.state.variables as CartAction | undefined,
    }).flatMap((action) => (action?.type === 'add' ? [action.productId, `${action.productId}:${action.finishId}`] : [])),
  );
}

export const plural = (count: number, singular: string, pluralForm = `${singular}s`) =>
  `${count} ${count > 1 ? pluralForm : singular}`;
