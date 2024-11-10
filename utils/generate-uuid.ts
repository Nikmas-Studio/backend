import { UUID } from '../global-types.ts';

export function generateUUID(): UUID {
  return crypto.randomUUID();
}
