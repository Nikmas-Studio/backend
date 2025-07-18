import { STATUS_CODE } from '@std/http/status';
import { Context, TypedResponse } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { checkPromoCodeValidityUtil } from '../utils/promo-codes.ts';

export class PromoCodesController {
  checkPromoCodeValidity(c: Context): Promise<TypedResponse> {
    const promoCode = c.req.param('promoCode');

    if (!promoCode) {
      throw new HTTPException(
        STATUS_CODE.BadRequest,
        {
          message: 'Promo code is required',
        },
      );
    }

    const { valid } = checkPromoCodeValidityUtil(promoCode);

    return Promise.resolve(c.json({ valid }, STATUS_CODE.OK));
  }
}
