import { z } from 'zod';
import { ApiResponse } from '../http/apiResponse.ts';
import { factory } from '../http/env.ts';
import { BffError } from '../http/errors.ts';
import { tenantQuery, validate } from '../http/validate.ts';
import { presentCatalogPage, presentCategory } from '../presenters/catalog.presenter.ts';

const catalogQuery = tenantQuery.extend({
  search: z.string().trim().max(100).optional(),
  // A category slug, as found in CategoryView.slug (the browser never sees raw category names in URLs).
  category: z.string().trim().max(50).optional(),
});

// GET /bff/catalog?tenant=&search=&category=<slug>
// Aggregation: categories first (to resolve the slug into the API's category name), then products.
export const catalogPageHandler = factory.createHandlers(validate('query', catalogQuery), async (c) => {
  const { tenant, search, category: slug } = c.req.valid('query');

  const categories = (await c.var.api.listCategories(tenant)).map(presentCategory);

  const category = slug ? categories.find((candidate) => candidate.slug === slug) : undefined;
  if (slug && !category) {
    throw new BffError(404, 'CATEGORY_NOT_FOUND', `Catégorie « ${slug} » introuvable`);
  }

  const products = await c.var.api.listProducts(tenant, { search, category: category?.name });

  // Slow-changing data: the browser may keep it for a few seconds.
  c.header('Cache-Control', 'private, max-age=10');
  return ApiResponse.ok(c, presentCatalogPage(products, categories, category));
});
