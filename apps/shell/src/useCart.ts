import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartQuery, queryKeys, runCartAction, type CartAction } from '@acme/bff-client';

// The shell owns the bag. No useEffect: reading is a query, writes are mutations,
// and the flyout opens as a consequence of the add itself.
export function useCart(tenantId: string) {
  const queryClient = useQueryClient();
  const query = useQuery(cartQuery(tenantId));
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    // Shared key: the catalog remote can tell an add is in progress without knowing the shell.
    mutationKey: queryKeys.cart(tenantId),
    mutationFn: (action: CartAction) => runCartAction(tenantId, action),
    // The BFF returns the up-to-date bag: we write it into the cache instead of doing another GET.
    onSuccess: (cart) => queryClient.setQueryData(queryKeys.cart(tenantId), cart),
    // After an add, show the bag: success shows the new line, a refusal shows why.
    onSettled: (_data, _error, action) => { if (action.type === 'add') setOpen(true); },
  });

  return {
    cart: query.data,
    loadError: query.error,
    retryLoad: () => query.refetch(),
    actionError: mutation.error,
    pending: mutation.isPending,
    resetActionError: mutation.reset,
    open,
    setOpen,
    add: (productId: string, finishId: string) => mutation.mutate({ type: 'add', productId, finishId }),
    remove: (lineId: string) => mutation.mutate({ type: 'remove', lineId }),
    clear: () => mutation.mutate({ type: 'clear' }),
  };
}

export type CartState = ReturnType<typeof useCart>;
