import type { ProductSnapshot } from '../domain/product-snapshot.ts';

// Outbound port: how the cart queries the catalog. Today an in-memory call,
// tomorrow an HTTP call to a separate catalog service, without touching the use cases.
export interface CatalogPort {
  tenantExists(tenantId: string): Promise<boolean>;
  findProduct(tenantId: string, productId: string): Promise<ProductSnapshot | null>;
}
