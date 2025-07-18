import { VALID_PROMO_CODES } from '../promo-codes.ts';

export function checkPromoCodeValidityUtil(promoCode: string): { valid: boolean } {
  return { valid: promoCode in VALID_PROMO_CODES };
} 

export function getPromoCodeTableIdUtil(promoCode: string): string | null {
  return VALID_PROMO_CODES[promoCode] || null;
}