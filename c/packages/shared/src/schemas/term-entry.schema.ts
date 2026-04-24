import { z } from 'zod';

export const termTypeEnum = z.enum(['fullForm', 'acronym', 'abbreviation', 'variant']);
export const termStatusEnum = z.enum(['preferred', 'admitted', 'deprecated']);

export const createTermEntrySchema = z.object({
  languageCode: z.string().trim().min(2).max(10),
  termText: z.string().trim().min(1).max(500),
  partOfSpeech: z.string().max(50).optional().nullable(),
  termType: termTypeEnum.optional().nullable(),
  status: termStatusEnum.optional().nullable(),
  contextExample: z.string().max(4000).optional().nullable(),
  definitionOverride: z.string().max(4000).optional().nullable(),
  source: z.string().max(255).optional().nullable(),
});

export const updateTermEntrySchema = createTermEntrySchema.partial().omit({ languageCode: true });

export const searchTermsQuerySchema = z.object({
  q: z.string().trim().min(1),
  lang: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateTermEntryInput = z.infer<typeof createTermEntrySchema>;
export type UpdateTermEntryInput = z.infer<typeof updateTermEntrySchema>;
export type SearchTermsQuery = z.infer<typeof searchTermsQuerySchema>;
