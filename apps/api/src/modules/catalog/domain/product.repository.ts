import type { Page, PageRequest } from '../../../shared/domain/page.ts';
import type { Product } from './product.ts';

export type ProductCriteria = PageRequest & { search?: string; category?: string };

// Port defined by the domain. The implementation (memory, SQL, legacy API…) lives in infrastructure/.
export interface ProductRepository {
  tenantExists(tenantId: string): Promise<boolean>;
  search(tenantId: string, criteria: ProductCriteria): Promise<Page<Product>>;
  findById(tenantId: string, productId: string): Promise<Product | null>;
  categories(tenantId: string): Promise<string[]>;
}
