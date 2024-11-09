import * as uuid from 'jsr:@std/uuid';
import { UUID } from '../general-types.ts';

export function generateUUID(): UUID {
  return uuid.v1.generate();
}
