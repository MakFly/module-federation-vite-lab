import { z } from 'zod';
import { ApiResponse } from '../http/apiResponse.ts';
import { factory } from '../http/env.ts';
import { tenantQuery, validate } from '../http/validate.ts';
import { presentCart } from '../presenters/cart.presenter.ts';
import { withCart } from './cart-session.ts';

const addItemBody = z.object({
  productId: z.string().min(1).max(32),
  finishId: z.string().min(1).max(32),
  quantity: z.number().int().min(1).max(99).default(1),
});

// POST /bff/cart/items?tenant=  { productId, finishId, quantity? }
export const addCartItemHandler = factory.createHandlers(
  validate('query', tenantQuery),
  validate('json', addItemBody),
  async (c) => {
    const { tenant } = c.req.valid('query');
    const item = c.req.valid('json');

    const cart = await withCart(c, tenant, (cartId) => c.var.api.addItem(tenant, cartId, item));
    return ApiResponse.ok(c, presentCart(cart));
  },
);
