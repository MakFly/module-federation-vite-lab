import type { CartDto } from '@acme/contracts';
import type { Context } from 'hono';
import type { AppEnv } from '../http/env.ts';
import { BffError } from '../http/errors.ts';

export const isCartGone = (error: unknown) => error instanceof BffError && error.code === 'CART_NOT_FOUND';

/**
 * Resolves the API cart tied to the session for an organization, creating it if needed.
 * If the API no longer knows it (restart, expiry), a new one is created, only once.
 */
export async function withCart(c: Context<AppEnv>, tenantId: string, action: (cartId: string) => Promise<CartDto>) {
  const { session, api } = c.var;

  const run = async () => {
    let cartId = session.cartIdFor(tenantId);
    if (!cartId) {
      cartId = (await api.createCart(tenantId)).id;
      session.attachCart(tenantId, cartId);
    }
    return action(cartId);
  };

  try {
    return await run();
  } catch (error) {
    if (!isCartGone(error)) throw error;
    session.forgetCart(tenantId);
    return run();
  }
}
