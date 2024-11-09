import * as uuid from '@std/uuid';
import { UUID } from '../global-types.ts';

export function generateUUID(): UUID {
  return uuid.v1.generate();
}
