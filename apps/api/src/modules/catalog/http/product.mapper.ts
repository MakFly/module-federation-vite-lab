import type { ProductDto } from '@acme/contracts';
import type { Product } from '../domain/product.ts';

// The entity never leaves as-is: we publish a stable DTO, decoupled from the internal model.
export const toProductDto = (product: Product): ProductDto => ({
  id: product.id,
  tenantId: product.tenantId,
  name: product.name,
  tagline: product.tagline,
  description: product.description,
  category: product.category,
  formFactor: product.formFactor,
  finishes: product.finishes,
  highlights: product.highlights,
  isNew: product.isNew,
  price: product.price.toJSON(),
  stock: product.stock,
});
