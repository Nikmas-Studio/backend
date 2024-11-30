import { AuthTokenId } from '../models/auth/types.ts';
import { OrderId } from '../models/subscription/types.ts';

export function generatePaymentGuestReturnURL(
  orderId: OrderId,
  authTokenId: AuthTokenId,
): URL {
  return new URL(
    `${Deno.env.get('FRONTEND_URL')}/payment-success?order=${orderId}&authToken=${authTokenId}`,
  );
}
