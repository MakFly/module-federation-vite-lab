import { z } from 'zod';
import { pageQuery, tenantParams } from '../../../shared/http/schemas.ts';

export { tenantParams };

export const productParams = tenantParams.extend({
  productId: z.string().min(1).max(32),
});

export const listProductsQuery = pageQuery.extend({
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(50).optional(),
});
