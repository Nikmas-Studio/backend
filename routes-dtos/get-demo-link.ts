import { z } from 'zod';

export const GetDemoLinkDTOSchema = z.object({
  email: z.string().email(),
  captchaToken: z.string().min(1),
  readerName: z.string().optional(),
});

export type GetDemoLinkDTO = z.infer<typeof GetDemoLinkDTOSchema>;
