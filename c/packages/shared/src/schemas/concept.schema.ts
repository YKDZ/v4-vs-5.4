import { z } from 'zod';

export const createConceptSchema = z.object({
  definition: z.string().trim().min(1).max(4000).optional().nullable(),
  subjectField: z.string().trim().max(255).optional().nullable(),
  note: z.string().max(4000).optional().nullable(),
});

export const updateConceptSchema = createConceptSchema.partial();

export const listConceptsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().optional(),
  lang: z.string().optional(),
});

export type CreateConceptInput = z.infer<typeof createConceptSchema>;
export type UpdateConceptInput = z.infer<typeof updateConceptSchema>;
export type ListConceptsQuery = z.infer<typeof listConceptsQuerySchema>;
