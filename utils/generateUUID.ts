import { v1 as uuid } from 'npm:uuid';
import { UUID } from '../general-types.ts';

export function generateUUID(): UUID {
  return uuid();
}
