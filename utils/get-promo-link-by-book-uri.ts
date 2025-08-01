import { BOOK_MASTER_ENGLISH_WITH_SHERLOCK_HOLMES_URI } from '../constants.ts';

export function getPromoLinkByBookURI(bookURI: string): string {
  switch (bookURI) {
    case BOOK_MASTER_ENGLISH_WITH_SHERLOCK_HOLMES_URI:
      return `${Deno.env.get('FRONTEND_URL')}/${BOOK_MASTER_ENGLISH_WITH_SHERLOCK_HOLMES_URI}`;
  }

  throw new Error(`No promo link defined for book URI: ${bookURI}`);
}