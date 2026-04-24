import { z } from 'zod';

export const regressionVerifySchema = z.object({
  sourceText: z.string().min(1),
  targetText: z.string().min(1),
  sourceLang: z.string().min(1).max(10),
  targetLang: z.string().min(1).max(10),
  reportName: z.string().max(255).optional(),
  matchThreshold: z.number().min(0).max(1).default(0.75),
});

export type RegressionVerifyInput = z.infer<typeof regressionVerifySchema>;
