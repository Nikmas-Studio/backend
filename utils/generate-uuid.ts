import { UUID } from '../types/global-types.ts';

export function generateUUID(): UUID {
  return crypto.randomUUID();
}
