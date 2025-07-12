import z from 'zod';

export const PaymentSuccessWayforpayDTOSchema = z.object({
  orderReference: z.string(),
});

export type PaymentHappenedWayforpayDTO = z.infer<
  typeof PaymentSuccessWayforpayDTOSchema
>;
