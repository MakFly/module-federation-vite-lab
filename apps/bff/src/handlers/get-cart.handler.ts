import { ApiResponse } from '../http/apiResponse.ts';
import { factory } from '../http/env.ts';
import { tenantQuery, validate } from '../http/validate.ts';
import { emptyCartView, presentCart } from '../presenters/cart.presenter.ts';
import { isCartGone } from './cart-session.ts';

// GET /bff/cart?tenant=
// A read creates nothing: without a cart in the session, we return an empty view.
export const getCartHandler = factory.createHandlers(validate('query', tenantQuery), async (c) => {
  const { tenant } = c.req.valid('query');
  const cartId = c.var.session.cartIdFor(tenant);
  c.header('Cache-Control', 'no-store');

  if (!cartId) return ApiResponse.ok(c, emptyCartView());

  try {
    return ApiResponse.ok(c, presentCart(await c.var.api.getCart(tenant, cartId)));
  } catch (error) {
    if (!isCartGone(error)) throw error;
    c.var.session.forgetCart(tenant);
    return ApiResponse.ok(c, emptyCartView());
  }
});
