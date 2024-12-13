import { z } from 'zod';

export const VerifyOrderIdDTOSchema = z.object({
  orderId: z.string().uuid(),
});

export type VerifyOrderIdDTO = z.infer<typeof VerifyOrderIdDTOSchema>;
