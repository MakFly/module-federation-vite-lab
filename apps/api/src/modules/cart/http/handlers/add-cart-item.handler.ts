import { ApiResponse } from '../../../../shared/http/apiResponse.ts';
import { factory } from '../../../../shared/http/env.ts';
import { validate } from '../../../../shared/http/validate.ts';
import type { AddItemToCart } from '../../application/cart.use-cases.ts';
import { toCartDto } from '../cart.mapper.ts';
import { addItemBody, cartParams } from '../cart.schemas.ts';

// POST /api/v1/tenants/:tenantId/carts/:cartId/items  { productId, finishId, quantity? }
export const addCartItemHandler = (useCase: AddItemToCart) =>
  factory.createHandlers(validate('param', cartParams), validate('json', addItemBody), async (c) => {
    const cart = await useCase.execute({ ...c.req.valid('param'), ...c.req.valid('json') });
    return ApiResponse.ok(c, toCartDto(cart));
  });
