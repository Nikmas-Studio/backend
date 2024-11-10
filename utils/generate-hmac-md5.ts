import { createHmac } from 'node:crypto';

export function generateHMACMD5(
  message: string,
  secretKey: string,
): string {
  return createHmac('md5', secretKey).update(message).digest('hex');
}
