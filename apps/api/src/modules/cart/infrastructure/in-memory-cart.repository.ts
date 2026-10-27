import { Cart, type CartSnapshot } from '../domain/cart.ts';
import type { CartRepository } from '../domain/cart.repository.ts';

// We store snapshots, not instances: an unsaved modification is never visible.
export class InMemoryCartRepository implements CartRepository {
  private readonly rows = new Map<string, CartSnapshot>();

  nextId() {
    return crypto.randomUUID();
  }

  async findById(cartId: string) {
    const row = this.rows.get(cartId);
    return row ? Cart.restore(structuredClone(row)) : null;
  }

  async save(cart: Cart) {
    this.rows.set(cart.id, cart.toSnapshot());
  }
}
