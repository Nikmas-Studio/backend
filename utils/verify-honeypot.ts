import { logError, logInfo } from './logger.ts';

export function verifyHoneypot(honeypot: string | undefined): { valid: boolean } {
  if (honeypot !== Deno.env.get('HONEYPOT_KEY')!) {
    logError(`honeypot field is not equeal to the expected value: ${honeypot}`);
    return { valid: false };
  }
  
  logInfo('honeypot field is valid');
  return { valid: true };
}