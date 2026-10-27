import { ApiResponse } from '../../../../shared/http/apiResponse.ts';
import { factory } from '../../../../shared/http/env.ts';
import { validate } from '../../../../shared/http/validate.ts';
import type { ListProducts } from '../../application/list-products.ts';
import { listProductsQuery, tenantParams } from '../catalog.schemas.ts';
import { toProductDto } from '../product.mapper.ts';

// GET /api/v1/tenants/:tenantId/products?search=&category=&page=&pageSize=
export const listProductsHandler = (useCase: ListProducts) =>
  factory.createHandlers(validate('param', tenantParams), validate('query', listProductsQuery), async (c) => {
    const { tenantId } = c.req.valid('param');
    const page = await useCase.execute({ tenantId, ...c.req.valid('query') });

    return ApiResponse.paginated(c, { ...page, items: page.items.map(toProductDto) });
  });
