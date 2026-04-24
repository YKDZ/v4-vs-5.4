import { z } from "zod";

export const conceptBaseSchema = z.object({
  definition: z.string().min(1).max(2000),
  subjectField: z.string().max(255).optional(),
  note: z.string().max(4000).optional(),
});

export const createConceptSchema = conceptBaseSchema;

export const updateConceptSchema = conceptBaseSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field must be provided.",
);

export const conceptListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  q: z.string().trim().optional(),
});

export type CreateConceptInput = z.infer<typeof createConceptSchema>;
export type UpdateConceptInput = z.infer<typeof updateConceptSchema>;
export type ConceptListQueryInput = z.infer<typeof conceptListQuerySchema>;
