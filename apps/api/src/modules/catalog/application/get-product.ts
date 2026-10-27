import { NotFoundError } from '../../../shared/domain/errors.ts';
import type { Product } from '../domain/product.ts';
import type { ProductRepository } from '../domain/product.repository.ts';

export class GetProduct {
  constructor(private readonly products: ProductRepository) {}

  async execute({ tenantId, productId }: { tenantId: string; productId: string }): Promise<Product> {
    const product = await this.products.findById(tenantId, productId);
    if (!product) throw new NotFoundError('PRODUCT_NOT_FOUND', `Produit « ${productId} » introuvable`);
    return product;
  }
}
