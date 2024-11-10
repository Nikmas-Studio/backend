import { z } from 'zod';

export const PurchaseBookGuestDTOSchema = z.object({
  email: z.string().email(),
  bookURI: z.string(),
});

export type PurchaseBookGuestDTO = z.infer<typeof PurchaseBookGuestDTOSchema>;
