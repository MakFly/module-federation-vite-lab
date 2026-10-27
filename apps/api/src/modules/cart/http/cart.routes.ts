import { Hono } from 'hono';
import type { AppEnv } from '../../../shared/http/env.ts';
import type { AddItemToCart, ClearCart, CreateCart, GetCart, RemoveCartItem } from '../application/cart.use-cases.ts';
import { addCartItemHandler } from './handlers/add-cart-item.handler.ts';
import { clearCartHandler } from './handlers/clear-cart.handler.ts';
import { createCartHandler } from './handlers/create-cart.handler.ts';
import { getCartHandler } from './handlers/get-cart.handler.ts';
import { removeCartItemHandler } from './handlers/remove-cart-item.handler.ts';

export type CartUseCases = {
  createCart: CreateCart;
  getCart: GetCart;
  addItem: AddItemToCart;
  removeItem: RemoveCartItem;
  clearCart: ClearCart;
};

export const cartRoutes = (useCases: CartUseCases) =>
  new Hono<AppEnv>()
    .post('/:tenantId/carts', ...createCartHandler(useCases.createCart))
    .get('/:tenantId/carts/:cartId', ...getCartHandler(useCases.getCart))
    .post('/:tenantId/carts/:cartId/items', ...addCartItemHandler(useCases.addItem))
    .delete('/:tenantId/carts/:cartId/items', ...clearCartHandler(useCases.clearCart))
    .delete('/:tenantId/carts/:cartId/items/:lineId', ...removeCartItemHandler(useCases.removeItem));
