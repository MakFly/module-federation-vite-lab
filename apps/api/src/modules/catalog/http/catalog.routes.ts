import { Hono } from 'hono';
import type { AppEnv } from '../../../shared/http/env.ts';
import type { GetProduct } from '../application/get-product.ts';
import type { ListCategories } from '../application/list-categories.ts';
import type { ListProducts } from '../application/list-products.ts';
import { getProductHandler } from './handlers/get-product.handler.ts';
import { listCategoriesHandler } from './handlers/list-categories.handler.ts';
import { listProductsHandler } from './handlers/list-products.handler.ts';

export type CatalogUseCases = {
  listProducts: ListProducts;
  getProduct: GetProduct;
  listCategories: ListCategories;
};

export const catalogRoutes = (useCases: CatalogUseCases) =>
  new Hono<AppEnv>()
    .get('/:tenantId/products', ...listProductsHandler(useCases.listProducts))
    .get('/:tenantId/products/:productId', ...getProductHandler(useCases.getProduct))
    .get('/:tenantId/categories', ...listCategoriesHandler(useCases.listCategories));
