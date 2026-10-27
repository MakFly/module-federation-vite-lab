import { ApiResponse } from '../../../../shared/http/apiResponse.ts';
import { factory } from '../../../../shared/http/env.ts';
import { validate } from '../../../../shared/http/validate.ts';
import type { GetProduct } from '../../application/get-product.ts';
import { productParams } from '../catalog.schemas.ts';
import { toProductDto } from '../product.mapper.ts';

// GET /api/v1/tenants/:tenantId/products/:productId
export const getProductHandler = (useCase: GetProduct) =>
  factory.createHandlers(validate('param', productParams), async (c) => {
    const product = await useCase.execute(c.req.valid('param'));
    return ApiResponse.ok(c, toProductDto(product));
  });
