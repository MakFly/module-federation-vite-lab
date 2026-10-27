import type { ProductRepository } from '../../catalog/domain/product.repository.ts';
import type { CatalogPort } from '../application/catalog.port.ts';
import type { ProductSnapshot } from '../domain/product-snapshot.ts';

// Anti-corruption layer: translates the catalog model into ProductSnapshot.
// This is the only file of the "cart" context that imports anything from the "catalog" context.
export class InProcessCatalogAdapter implements CatalogPort {
  constructor(private readonly products: ProductRepository) {}

  tenantExists(tenantId: string) {
    return this.products.tenantExists(tenantId);
  }

  async findProduct(tenantId: string, productId: string): Promise<ProductSnapshot | null> {
    const product = await this.products.findById(tenantId, productId);
    return product && {
      id: product.id,
      name: product.name,
      formFactor: product.formFactor,
      finishes: product.finishes,
      price: product.price,
      stock: product.stock,
    };
  }
}
