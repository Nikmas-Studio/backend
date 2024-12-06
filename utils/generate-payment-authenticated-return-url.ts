import { OrderId } from '../models/subscription/types.ts';

export function generatePaymentAuthenticatedReturnURL(
  orderId: OrderId,
): URL {
  return new URL(
    `${Deno.env.get('BACKEND_URL')}/payment-success?order=${orderId}`,
  );
}
