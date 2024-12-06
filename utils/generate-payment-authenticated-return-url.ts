import { SessionId } from '../models/auth/types.ts';
import { OrderId } from '../models/subscription/types.ts';

export function generatePaymentAuthenticatedReturnURL(
  orderId: OrderId,
  sessionId: SessionId,
): URL {
  return new URL(
    `${Deno.env.get('BACKEND_URL')}/payment-success?order=${orderId}&session=${sessionId}`,
  );
}
