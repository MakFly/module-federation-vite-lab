import { ApiResponse } from '../../../../shared/http/apiResponse.ts';
import { factory } from '../../../../shared/http/env.ts';
import { validate } from '../../../../shared/http/validate.ts';
import type { ClearCart } from '../../application/cart.use-cases.ts';
import { toCartDto } from '../cart.mapper.ts';
import { cartParams } from '../cart.schemas.ts';

// DELETE /api/v1/tenants/:tenantId/carts/:cartId/items
export const clearCartHandler = (useCase: ClearCart) =>
  factory.createHandlers(validate('param', cartParams), async (c) => {
    const cart = await useCase.execute(c.req.valid('param'));
    return ApiResponse.ok(c, toCartDto(cart));
  });
