import { z } from 'zod';

export const LoginDTOSchema = z.object({
  email: z.string().email(),
});

export type LoginDTO = z.infer<typeof LoginDTOSchema>;
