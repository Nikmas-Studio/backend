import { z } from 'zod';

export const PurchaseBookGuestDTOSchema = z.object({
  email: z.string().email(),
  bookURI: z.string(),
  captchaToken: z.string().min(1),
  readerName: z.string().optional(),
});

export type PurchaseBookGuestDTO = z.infer<typeof PurchaseBookGuestDTOSchema>;
