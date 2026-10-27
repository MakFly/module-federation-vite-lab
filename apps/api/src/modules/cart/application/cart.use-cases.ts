import { NotFoundError } from '../../../shared/domain/errors.ts';
import { Cart } from '../domain/cart.ts';
import type { CartRepository } from '../domain/cart.repository.ts';
import type { CatalogPort } from './catalog.port.ts';

type CartRef = { tenantId: string; cartId: string };

// Each use case follows the same pattern: load the aggregate, call the domain, save.
// No business rule here: they are all in Cart.

async function load(carts: CartRepository, { tenantId, cartId }: CartRef): Promise<Cart> {
  const cart = await carts.findById(cartId);
  // A cart from another organization is treated as nonexistent: its existence is not revealed.
  if (!cart || cart.tenantId !== tenantId) throw new NotFoundError('CART_NOT_FOUND', `Panier « ${cartId} » introuvable`);
  return cart;
}

export class CreateCart {
  constructor(private readonly carts: CartRepository, private readonly catalog: CatalogPort) {}

  async execute({ tenantId }: { tenantId: string }): Promise<Cart> {
    if (!(await this.catalog.tenantExists(tenantId))) {
      throw new NotFoundError('TENANT_NOT_FOUND', `Organisation « ${tenantId} » inconnue`);
    }
    const cart = Cart.create(this.carts.nextId(), tenantId);
    await this.carts.save(cart);
    return cart;
  }
}

export class GetCart {
  constructor(private readonly carts: CartRepository) {}

  execute(ref: CartRef): Promise<Cart> {
    return load(this.carts, ref);
  }
}

export class AddItemToCart {
  constructor(private readonly carts: CartRepository, private readonly catalog: CatalogPort) {}

  async execute(input: CartRef & { productId: string; finishId: string; quantity: number }): Promise<Cart> {
    const cart = await load(this.carts, input);
    const product = await this.catalog.findProduct(input.tenantId, input.productId);
    if (!product) throw new NotFoundError('PRODUCT_NOT_FOUND', `Produit « ${input.productId} » introuvable`);

    cart.addItem(product, input.finishId, input.quantity);
    await this.carts.save(cart);
    return cart;
  }
}

export class RemoveCartItem {
  constructor(private readonly carts: CartRepository) {}

  async execute(input: CartRef & { lineId: string }): Promise<Cart> {
    const cart = await load(this.carts, input);
    cart.removeItem(input.lineId);
    await this.carts.save(cart);
    return cart;
  }
}

export class ClearCart {
  constructor(private readonly carts: CartRepository) {}

  async execute(ref: CartRef): Promise<Cart> {
    const cart = await load(this.carts, ref);
    cart.clear();
    await this.carts.save(cart);
    return cart;
  }
}
