import { z } from 'zod';

export const tenantParams = z.object({
  tenantId: z.string().regex(/^[a-z0-9-]{1,32}$/, 'Identifiant d’organisation invalide'),
});

export const pageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
