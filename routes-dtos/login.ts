import { z } from 'zod';

export const LoginDTOSchema = z.object({
  email: z.string().email(),
  captchaToken: z.string().min(1),
  readerName: z.string().optional(),
});

export type LoginDTO = z.infer<typeof LoginDTOSchema>;
