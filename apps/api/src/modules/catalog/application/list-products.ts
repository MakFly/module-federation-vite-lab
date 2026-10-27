import { NotFoundError } from '../../../shared/domain/errors.ts';
import type { ProductCriteria, ProductRepository } from '../domain/product.repository.ts';

export type ListProductsInput = ProductCriteria & { tenantId: string };

export class ListProducts {
  constructor(private readonly products: ProductRepository) {}

  async execute({ tenantId, ...criteria }: ListProductsInput) {
    if (!(await this.products.tenantExists(tenantId))) {
      throw new NotFoundError('TENANT_NOT_FOUND', `Organisation « ${tenantId} » inconnue`);
    }
    return this.products.search(tenantId, criteria);
  }
}
