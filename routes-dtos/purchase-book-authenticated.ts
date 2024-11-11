import { z } from 'zod';

export const PurchaseBookAuthenticatedDTOSchema = z.object({
  bookURI: z.string(),
});

export type PurchaseBookAuthenticatedDTO = z.infer<
  typeof PurchaseBookAuthenticatedDTOSchema
>;
