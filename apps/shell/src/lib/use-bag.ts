import { useQuery } from '@tanstack/react-query';
import { useFetcher, useFetchers } from 'react-router';
import type { BagActionResult } from '@acme/contracts';
import { cartQuery, paths, type CartAction } from '@acme/bff-client';
import { bagUi, useBagUi } from './bag-ui';

// The bag as the shell's UI sees it: the cart (a query), the flyout state, and the bag action's
// fetchers, whichever app submitted them (the remote's adds included).
export function useBag(country: string) {
  const query = useQuery(cartQuery(country));
  const ui = useBagUi();
  const fetcher = useFetcher<BagActionResult>();
  // useFetchers() lists in-flight fetchers only.
  const pending = useFetchers().some((item) => item.formAction === paths.bag(country));
  const submit = (action: CartAction) => fetcher.submit(action, { method: 'post', action: paths.bag(country) });

  return {
    cart: query.data,
    loadError: query.error,
    retryLoad: () => query.refetch(),
    actionError: ui.error,
    pending,
    open: ui.open,
    setOpen: bagUi.setOpen,
    remove: (lineId: string) => submit({ type: 'remove', lineId }),
    clear: () => submit({ type: 'clear' }),
  };
}

export type BagState = ReturnType<typeof useBag>;
