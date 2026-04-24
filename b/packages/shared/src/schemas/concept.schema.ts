import { z } from 'zod';
import { paginationQuerySchema, requiredStringSchema, trimmedOptionalStringSchema } from './common.schema';
import { termEntryFieldsSchema } from './term-entry.schema';
import { languageCodeSchema } from './common.schema';

export const conceptFieldsSchema = z.object({
  definition: requiredStringSchema,
  subjectField: z.string().trim().min(1).max(255),
  note: trimmedOptionalStringSchema,
});

export const conceptLanguageSectionSchema = z.object({
  languageCode: languageCodeSchema,
  termEntries: z.array(termEntryFieldsSchema).min(1),
});

export const createConceptSchema = conceptFieldsSchema.extend({
  languageSections: z.array(conceptLanguageSectionSchema).min(1),
});

export const updateConceptSchema = conceptFieldsSchema
  .extend({
    languageSections: z.array(conceptLanguageSectionSchema).min(1).optional(),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided');

export const conceptQuerySchema = paginationQuerySchema;

export type CreateConceptInput = z.input<typeof createConceptSchema>;
export type UpdateConceptInput = z.input<typeof updateConceptSchema>;
export type ConceptQueryInput = z.infer<typeof conceptQuerySchema>;
