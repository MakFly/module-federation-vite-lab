import { zValidator } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import type { ZodType } from 'zod';
import { ValidationError } from '../domain/errors.ts';

// Converts a Zod failure into a ValidationError: the error format stays that of ApiResponse.
export const validate = <T extends ZodType, Target extends keyof ValidationTargets>(target: Target, schema: T) =>
  zValidator(target, schema, (result) => {
    if (!result.success) {
      throw new ValidationError(
        'VALIDATION_ERROR',
        'Requête invalide',
        result.error.issues.map((issue) => ({
          field: issue.path.join('.') || target,
          message: issue.message,
        })),
      );
    }
  });
