import { z } from 'zod';
import { termStatuses, termTypes } from '../types/term-entry';
import { languageCodeSchema, requiredStringSchema, trimmedOptionalStringSchema } from './common.schema';

export const termTypeSchema = z.enum(termTypes);
export const termStatusSchema = z.enum(termStatuses);

export const termEntryFieldsSchema = z.object({
  termText: requiredStringSchema.max(500),
  partOfSpeech: trimmedOptionalStringSchema,
  termType: termTypeSchema.default('fullForm'),
  status: termStatusSchema.default('preferred'),
  contextExample: trimmedOptionalStringSchema,
  definitionOverride: trimmedOptionalStringSchema,
  source: z
    .string()
    .trim()
    .max(255)
    .optional()
    .nullable()
    .transform((value) => {
      if (value == null) {
        return null;
      }

      return value.length === 0 ? null : value;
    }),
});

export const createTermEntrySchema = termEntryFieldsSchema.extend({
  languageCode: languageCodeSchema,
});

export const updateTermEntrySchema = termEntryFieldsSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'At least one field must be provided',
);

export const termSearchQuerySchema = z.object({
  q: z.string().trim().min(1).max(200),
  lang: languageCodeSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export type CreateTermEntryInput = z.input<typeof createTermEntrySchema>;
export type UpdateTermEntryInput = z.input<typeof updateTermEntrySchema>;
