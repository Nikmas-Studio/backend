import { z } from 'zod';

export const LogDTOSchema = z.object({
  message: z.string(),
});

export type LogDTO = z.infer<typeof LogDTOSchema>;
