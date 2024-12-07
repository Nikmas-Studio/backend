import { AuthTokenId } from '../models/auth/types.ts';
import { OrderId } from '../models/subscription/types.ts';

export function generatePaymentGuestReturnURL(
  orderId: OrderId,
  authTokenId: AuthTokenId,
): URL {
  return new URL(
    `${Deno.env.get('FRONTEND_URL')}/api/payment-success?order=${orderId}&authToken=${authTokenId}`,
  );
}
