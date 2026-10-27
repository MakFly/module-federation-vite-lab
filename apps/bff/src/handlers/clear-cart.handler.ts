import { ApiResponse } from '../http/apiResponse.ts';
import { factory } from '../http/env.ts';
import { tenantQuery, validate } from '../http/validate.ts';
import { emptyCartView, presentCart } from '../presenters/cart.presenter.ts';

// DELETE /bff/cart?tenant=
export const clearCartHandler = factory.createHandlers(validate('query', tenantQuery), async (c) => {
  const { tenant } = c.req.valid('query');
  const cartId = c.var.session.cartIdFor(tenant);

  if (!cartId) return ApiResponse.ok(c, emptyCartView());
  return ApiResponse.ok(c, presentCart(await c.var.api.clearCart(tenant, cartId)));
});
