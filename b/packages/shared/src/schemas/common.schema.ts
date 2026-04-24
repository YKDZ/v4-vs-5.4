import { z } from 'zod';

export const trimmedOptionalStringSchema = z
  .string()
  .trim()
  .max(4000)
  .optional()
  .nullable()
  .transform((value) => {
    if (value == null) {
      return null;
    }

    return value.length === 0 ? null : value;
  });

export const requiredStringSchema = z.string().trim().min(1).max(4000);

export const languageCodeSchema = z
  .string()
  .trim()
  .regex(/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})?$/, 'Invalid language code');

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().max(200).optional(),
});
