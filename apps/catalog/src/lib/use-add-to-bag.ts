import { useFetcher } from 'react-router';
import type { BagActionResult } from '@acme/contracts';
import { paths, type CartAction } from '@acme/bff-client';

// The remote never touches the bag: it posts a CartAction to the shell's bag action, by URL.
// Keyed fetcher: every button for the same product (hero, sticky sub-nav) shares one pending state.
export function useAddToBag(country: string, productId: string) {
  const fetcher = useFetcher<BagActionResult>({ key: `bag-add:${country}:${productId}` });
  return {
    adding: fetcher.state !== 'idle',
    add: (finishId: string) =>
      fetcher.submit({ type: 'add', productId, finishId } satisfies CartAction, { method: 'post', action: paths.bag(country) }),
  };
}
