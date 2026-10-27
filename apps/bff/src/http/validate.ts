import { zValidator } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import { z, type ZodType } from 'zod';
import { BffError } from './errors.ts';

export const validate = <T extends ZodType, Target extends keyof ValidationTargets>(target: Target, schema: T) =>
  zValidator(target, schema, (result) => {
    if (!result.success) {
      throw new BffError(400, 'VALIDATION_ERROR', 'Requête invalide', result.error.issues.map((issue) => ({
        field: issue.path.join('.') || target,
        message: issue.message,
      })));
    }
  });

export const tenantQuery = z.object({
  tenant: z.string().regex(/^[a-z0-9-]{1,32}$/, 'Organisation invalide'),
});
