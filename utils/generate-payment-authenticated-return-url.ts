import { OrderId } from '../models/subscription/types.ts';

export function generatePaymentAuthenticatedReturnURL(
  orderId: OrderId,
): URL {
  return new URL(
    `https://nikmas.studio/payment-success?order=${orderId}`,
  );
}
