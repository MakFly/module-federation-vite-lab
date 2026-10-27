import { ApiResponse } from '../../../../shared/http/apiResponse.ts';
import { factory } from '../../../../shared/http/env.ts';
import { validate } from '../../../../shared/http/validate.ts';
import type { CreateCart } from '../../application/cart.use-cases.ts';
import { toCartDto } from '../cart.mapper.ts';
import { tenantParams } from '../cart.schemas.ts';

// POST /api/v1/tenants/:tenantId/carts -> 201 + Location
export const createCartHandler = (useCase: CreateCart) =>
  factory.createHandlers(validate('param', tenantParams), async (c) => {
    const { tenantId } = c.req.valid('param');
    const cart = await useCase.execute({ tenantId });

    return ApiResponse.created(c, toCartDto(cart), `/api/v1/tenants/${tenantId}/carts/${cart.id}`);
  });
