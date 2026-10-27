import { z } from 'zod';
import { tenantParams } from '../../../shared/http/schemas.ts';

export { tenantParams };

export const cartParams = tenantParams.extend({
  cartId: z.uuid('Identifiant de panier invalide'),
});

// A line id is `${productId}:${finishId}`.
export const cartLineParams = cartParams.extend({
  lineId: z.string().regex(/^[a-z0-9-]{1,32}:[a-z0-9-]{1,32}$/, 'Identifiant de ligne invalide'),
});

// The schema checks the shape; business limits (finish, max per line, stock) stay in the domain.
export const addItemBody = z.object({
  productId: z.string().min(1).max(32),
  finishId: z.string().min(1).max(32),
  quantity: z.number().int().min(1).default(1),
});
