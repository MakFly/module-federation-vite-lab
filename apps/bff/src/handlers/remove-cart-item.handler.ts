import { z } from 'zod';
import { ApiResponse } from '../http/apiResponse.ts';
import { factory } from '../http/env.ts';
import { tenantQuery, validate } from '../http/validate.ts';
import { presentCart } from '../presenters/cart.presenter.ts';
import { withCart } from './cart-session.ts';

// A line id is `${productId}:${finishId}`.
const lineParams = z.object({
  lineId: z.string().regex(/^[a-z0-9-]{1,32}:[a-z0-9-]{1,32}$/, 'Identifiant de ligne invalide'),
});

// DELETE /bff/cart/items/:lineId?tenant=
export const removeCartItemHandler = factory.createHandlers(
  validate('param', lineParams),
  validate('query', tenantQuery),
  async (c) => {
    const { lineId } = c.req.valid('param');
    const { tenant } = c.req.valid('query');

    const cart = await withCart(c, tenant, (cartId) => c.var.api.removeItem(tenant, cartId, lineId));
    return ApiResponse.ok(c, presentCart(cart));
  },
);
