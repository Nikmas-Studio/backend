import z from 'zod';

export const PaymentSuccessAuthenticatedDTOSchema = z.object({
  orderId: z.string().uuid(),
});

export type PaymentSuccessAuthenticatedDTO = z.infer<
  typeof PaymentSuccessAuthenticatedDTOSchema
>;
