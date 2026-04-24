import { z } from "zod";

export const verifyRegressionSchema = z.object({
  reportName: z.string().min(1).max(255),
  sourceText: z.string().min(1),
  targetText: z.string().min(1),
  sourceLang: z.string().min(2).max(10),
  targetLang: z.string().min(2).max(10),
  matchThreshold: z.number().min(0).max(1).default(0.75),
});

export const regressionReportListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});

export type VerifyRegressionInput = z.infer<typeof verifyRegressionSchema>;
