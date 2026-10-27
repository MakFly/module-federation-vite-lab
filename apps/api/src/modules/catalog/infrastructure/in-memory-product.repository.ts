import { paginate, type Page } from '../../../shared/domain/page.ts';
import type { Product } from '../domain/product.ts';
import type { ProductCriteria, ProductRepository } from '../domain/product.repository.ts';

// In-memory adapter. To migrate to a database or a legacy service, we write another adapter
// that implements ProductRepository: neither the domain, nor the use cases, nor the handlers change.
export class InMemoryProductRepository implements ProductRepository {
  constructor(private readonly products: Product[]) {}

  async tenantExists(tenantId: string) {
    return this.products.some((product) => product.tenantId === tenantId);
  }

  async search(tenantId: string, { search, category, ...page }: ProductCriteria): Promise<Page<Product>> {
    const matching = this.byTenant(tenantId).filter((product) => product.matches({ search, category }));
    return paginate(matching, page);
  }

  async findById(tenantId: string, productId: string) {
    return this.byTenant(tenantId).find((product) => product.id === productId) ?? null;
  }

  // Merchandising order: categories come in the order they first appear in the catalog, not alphabetically.
  async categories(tenantId: string) {
    return [...new Set(this.byTenant(tenantId).map((product) => product.category))];
  }

  private byTenant(tenantId: string) {
    return this.products.filter((product) => product.tenantId === tenantId);
  }
}
