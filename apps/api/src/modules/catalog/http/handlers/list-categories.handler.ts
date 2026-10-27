import { ApiResponse } from '../../../../shared/http/apiResponse.ts';
import { factory } from '../../../../shared/http/env.ts';
import { validate } from '../../../../shared/http/validate.ts';
import type { ListCategories } from '../../application/list-categories.ts';
import { tenantParams } from '../catalog.schemas.ts';

// GET /api/v1/tenants/:tenantId/categories
export const listCategoriesHandler = (useCase: ListCategories) =>
  factory.createHandlers(validate('param', tenantParams), async (c) => {
    return ApiResponse.ok(c, await useCase.execute(c.req.valid('param')));
  });
