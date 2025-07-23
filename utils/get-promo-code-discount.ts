import {
  DEFAULT_PROMO_CODE_DISCOUNT,
  IT_CLUB_PROMO_CODE_DISCOUNT,
} from '../constants.ts';

export function getPromoCodeDiscount(promoCode: string): number {
  if (promoCode === 'it-club-1111') {
    return IT_CLUB_PROMO_CODE_DISCOUNT;
  }

  return DEFAULT_PROMO_CODE_DISCOUNT;
}
