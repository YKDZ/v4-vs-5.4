import { z } from "zod";

export const importTbxSchema = z.object({
  tbxContent: z.string().min(1),
});

export type ImportTbxInput = z.infer<typeof importTbxSchema>;
