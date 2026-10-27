import { z } from 'zod';
import { ApiResponse } from '../http/apiResponse.ts';
import { factory } from '../http/env.ts';
import { tenantQuery, validate } from '../http/validate.ts';
import { presentProductPage } from '../presenters/catalog.presenter.ts';

const productParams = z.object({
  productId: z.string().regex(/^[a-z0-9-]{1,32}$/, 'Identifiant de produit invalide'),
});

// GET /bff/products/:productId?tenant=
// Aggregation: the product and the tenant's catalog in parallel; the catalog feeds the "related" shelf.
export const productPageHandler = factory.createHandlers(
  validate('param', productParams),
  validate('query', tenantQuery),
  async (c) => {
    const { productId } = c.req.valid('param');
    const { tenant } = c.req.valid('query');

    const [product, catalog] = await Promise.all([
      c.var.api.getProduct(tenant, productId),
      c.var.api.listProducts(tenant, {}),
    ]);

    // Slow-changing data: the browser may keep it for a few seconds.
    c.header('Cache-Control', 'private, max-age=10');
    return ApiResponse.ok(c, presentProductPage(product, catalog));
  },
);
