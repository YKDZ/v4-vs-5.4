import { z } from 'zod';

export const regressionVerifySchema = z.object({
  reportName: z.string().trim().min(1).max(255).default('Untitled report'),
  sourceText: z.string().min(1),
  targetText: z.string().min(1),
  sourceLang: z.string().trim().min(2).max(10),
  targetLang: z.string().trim().min(2).max(10),
  matchThreshold: z.number().min(0).max(1).default(0.75),
  persist: z.boolean().default(true),
});

export type RegressionVerifyInput = z.infer<typeof regressionVerifySchema>;
