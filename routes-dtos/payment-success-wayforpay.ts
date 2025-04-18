import z from 'zod';

export const PaymentSuccessWayforpayDTOSchema = z.object({
  orderReference: z.string(),
});

export type PaymentSuccessWayforpayDTO = z.infer<
  typeof PaymentSuccessWayforpayDTOSchema
>;
