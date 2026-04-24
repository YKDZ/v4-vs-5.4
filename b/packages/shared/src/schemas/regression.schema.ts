import { z } from 'zod';
import { regressionMatchTypes, regressionStatuses } from '../types/regression';
import { languageCodeSchema, requiredStringSchema } from './common.schema';

export const regressionMatchTypeSchema = z.enum(regressionMatchTypes);
export const regressionStatusSchema = z.enum(regressionStatuses);

export const verifyRegressionSchema = z.object({
  reportName: requiredStringSchema.max(255),
  sourceText: requiredStringSchema,
  targetText: requiredStringSchema,
  sourceLang: languageCodeSchema,
  targetLang: languageCodeSchema,
  matchThreshold: z.number().min(0.5).max(1).default(0.75),
});

export type VerifyRegressionInput = z.infer<typeof verifyRegressionSchema>;
