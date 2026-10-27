import { ApiResponse } from '../../../../shared/http/apiResponse.ts';
import { factory } from '../../../../shared/http/env.ts';
import { validate } from '../../../../shared/http/validate.ts';
import type { RemoveCartItem } from '../../application/cart.use-cases.ts';
import { toCartDto } from '../cart.mapper.ts';
import { cartLineParams } from '../cart.schemas.ts';

// DELETE /api/v1/tenants/:tenantId/carts/:cartId/items/:lineId
export const removeCartItemHandler = (useCase: RemoveCartItem) =>
  factory.createHandlers(validate('param', cartLineParams), async (c) => {
    const cart = await useCase.execute(c.req.valid('param'));
    return ApiResponse.ok(c, toCartDto(cart));
  });
