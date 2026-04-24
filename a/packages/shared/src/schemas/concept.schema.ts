import { z } from 'zod';

export const createConceptSchema = z.object({
  definition: z.string().optional(),
  subjectField: z.string().max(255).optional(),
  note: z.string().optional(),
});

export const updateConceptSchema = z.object({
  definition: z.string().optional(),
  subjectField: z.string().max(255).optional().nullable(),
  note: z.string().optional().nullable(),
});

export const conceptQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

export type CreateConceptInput = z.infer<typeof createConceptSchema>;
export type UpdateConceptInput = z.infer<typeof updateConceptSchema>;
export type ConceptQuery = z.infer<typeof conceptQuerySchema>;
