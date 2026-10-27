import type { QueryClient } from '@tanstack/react-query';
import { data, type ActionFunctionArgs } from 'react-router';
import type { BagActionResult } from '@acme/contracts';
import { BffRequestError, queryKeys, runCartAction, type CartAction } from '@acme/bff-client';
import { bagUi } from '../lib/bag-ui';

const field = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === 'string' && value ? value : undefined;
};

function toCartAction(form: FormData): CartAction | undefined {
  const productId = field(form, 'productId');
  const finishId = field(form, 'finishId');
  const lineId = field(form, 'lineId');
  switch (field(form, 'type')) {
    case 'add': return productId && finishId ? { type: 'add', productId, finishId } : undefined;
    case 'remove': return lineId ? { type: 'remove', lineId } : undefined;
    case 'clear': return { type: 'clear' };
  }
}

/**
 * POST /:country/sac: the one way to change the bag, for the shell and for every remote.
 * The contract is a URL and form fields (a CartAction), not a callback: a remote submits with a
 * fetcher and reads its pending state, without importing anything from the shell.
 */
export const createBagAction = (queryClient: QueryClient) =>
  async ({ request, params }: ActionFunctionArgs): Promise<BagActionResult> => {
    const country = params.country!;
    const action = toCartAction(await request.formData());
    if (!action) throw data('Requête de sac invalide.', { status: 400 });

    try {
      const cart = await runCartAction(country, action);
      // The BFF returns the up-to-date bag: write it into the cache instead of doing another GET.
      queryClient.setQueryData(queryKeys.cart(country), cart);
      if (action.type === 'add') bagUi.show();
      else bagUi.clearError();
      return { ok: true };
    } catch (error) {
      if (!(error instanceof BffRequestError)) throw error;
      // A business refusal ("Plus que 2 « Onde » en stock") is shown in the bag, opened if needed.
      if (action.type === 'add') bagUi.show(error.message);
      else bagUi.fail(error.message);
      return { ok: false, error: error.message };
    }
  };
