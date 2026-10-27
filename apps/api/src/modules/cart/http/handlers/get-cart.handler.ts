import { ApiResponse } from '../../../../shared/http/apiResponse.ts';
import { factory } from '../../../../shared/http/env.ts';
import { validate } from '../../../../shared/http/validate.ts';
import type { GetCart } from '../../application/cart.use-cases.ts';
import { toCartDto } from '../cart.mapper.ts';
import { cartParams } from '../cart.schemas.ts';

// GET /api/v1/tenants/:tenantId/carts/:cartId
export const getCartHandler = (useCase: GetCart) =>
  factory.createHandlers(validate('param', cartParams), async (c) => {
    const cart = await useCase.execute(c.req.valid('param'));
    return ApiResponse.ok(c, toCartDto(cart));
  });
