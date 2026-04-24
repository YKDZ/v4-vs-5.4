import { z } from 'zod';

const termTypeEnum = z.enum(['fullForm', 'acronym', 'abbreviation', 'variant']);
const termStatusEnum = z.enum(['preferred', 'admitted', 'deprecated']);

export const createTermEntrySchema = z.object({
  languageCode: z.string().min(1).max(10),
  termText: z.string().min(1).max(500),
  partOfSpeech: z.string().max(50).optional(),
  termType: termTypeEnum.optional(),
  status: termStatusEnum.optional(),
  contextExample: z.string().optional(),
  definitionOverride: z.string().optional(),
  source: z.string().max(255).optional(),
});

export const updateTermEntrySchema = z.object({
  termText: z.string().min(1).max(500).optional(),
  partOfSpeech: z.string().max(50).optional().nullable(),
  termType: termTypeEnum.optional().nullable(),
  status: termStatusEnum.optional().nullable(),
  contextExample: z.string().optional().nullable(),
  definitionOverride: z.string().optional().nullable(),
  source: z.string().max(255).optional().nullable(),
});

export const termSearchSchema = z.object({
  q: z.string().min(1),
  lang: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateTermEntryInput = z.infer<typeof createTermEntrySchema>;
export type UpdateTermEntryInput = z.infer<typeof updateTermEntrySchema>;
export type TermSearchQuery = z.infer<typeof termSearchSchema>;
