import { NotFoundError } from '../../../shared/domain/errors.ts';
import type { ProductRepository } from '../domain/product.repository.ts';

export class ListCategories {
  constructor(private readonly products: ProductRepository) {}

  async execute({ tenantId }: { tenantId: string }): Promise<string[]> {
    if (!(await this.products.tenantExists(tenantId))) {
      throw new NotFoundError('TENANT_NOT_FOUND', `Organisation « ${tenantId} » inconnue`);
    }
    return this.products.categories(tenantId);
  }
}
