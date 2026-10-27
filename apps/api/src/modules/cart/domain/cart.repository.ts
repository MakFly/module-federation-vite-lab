import type { Cart } from './cart.ts';

export interface CartRepository {
  nextId(): string;
  findById(cartId: string): Promise<Cart | null>;
  save(cart: Cart): Promise<void>;
}
