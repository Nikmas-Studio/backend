import { AuthTokenId } from '../models/auth/types.ts';
import { OrderId } from '../models/subscription/types.ts';

export function generatePaymentGuestReturnURL(
  orderId: OrderId,
  authTokenId: AuthTokenId,
): URL {
  return new URL(
    `https://nikmas.studio/payment-success?order=${orderId}&authToken=${authTokenId}`,
  );
}
