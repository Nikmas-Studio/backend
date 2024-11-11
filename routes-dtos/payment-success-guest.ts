import z from 'zod';

export const PaymentSuccessGuestDTOSchema = z.object({
  authToken: z.string().uuid(),
  orderId: z.string().uuid(),
});

export type PaymentSuccessGuestDTO = z.infer<
  typeof PaymentSuccessGuestDTOSchema
>;
