import { z } from 'zod';

export const LogErrorDTOSchema = z.object({
  error: z.string(),
});

export type LogErrorDTO = z.infer<typeof LogErrorDTOSchema>;