import { z } from "zod";

export const partOfSpeechEnum = z.enum([
  "noun",
  "verb",
  "adjective",
  "adverb",
  "phrase",
  "other",
]);

export const termTypeEnum = z.enum([
  "fullForm",
  "acronym",
  "abbreviation",
  "variant",
]);

export const termStatusEnum = z.enum(["preferred", "admitted", "deprecated"]);

const termEntryBaseSchema = z.object({
  termText: z.string().min(1).max(500),
  partOfSpeech: partOfSpeechEnum.optional(),
  termType: termTypeEnum.optional(),
  status: termStatusEnum.default("preferred"),
  contextExample: z.string().max(4000).optional(),
  definitionOverride: z.string().max(4000).optional(),
  source: z.string().max(255).optional(),
});

export const createTermEntrySchema = termEntryBaseSchema.extend({
  languageCode: z.string().min(2).max(10),
});

export const updateTermEntrySchema = termEntryBaseSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field must be provided.",
);

export const termQuerySchema = z.object({
  lang: z.string().min(2).max(10),
});

export const termSearchQuerySchema = z.object({
  q: z.string().min(1).max(500),
  lang: z.string().min(2).max(10).optional(),
});

export type CreateTermEntryInput = z.infer<typeof createTermEntrySchema>;
export type UpdateTermEntryInput = z.infer<typeof updateTermEntrySchema>;
export type TermSearchQueryInput = z.infer<typeof termSearchQuerySchema>;
