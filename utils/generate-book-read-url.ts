import { OrderId } from '../models/subscription/types.ts';

export function generateBookReadUrl(bookURI: string, orderId: OrderId): string {
  return `${Deno.env.get('FRONTEND_URL')}/${bookURI}/read?order=${orderId}`;
}