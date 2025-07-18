import Airtable from 'airtable';
import { logError } from './logger.ts';
import { VALID_PROMO_CODES } from '../promo-codes.ts';
import { AIRTABLE_BASE_ID } from '../constants.ts';

export function addPartnerPurchase(
  promoCode: string,
  readerEmail: string,
  bookTitle: string,
): void {
  const table = VALID_PROMO_CODES[promoCode];

  const base = new Airtable({ apiKey: Deno.env.get('AIRTABLE_API_KEY') }).base(
    AIRTABLE_BASE_ID,
  );

  base(table).create([
    {
      'fields': {
        'Date': new Date().toISOString(),
        'Email': readerEmail,
        'Book Title': bookTitle,
      },
    },
  ], function (err): void {
    if (err) {
      logError(
        `Error adding partner purchase for ${readerEmail} and book ${bookTitle}: ${err})`,
      );
    }
  });
}
