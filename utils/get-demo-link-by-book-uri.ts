import { BOOK_MASTER_ENGLISH_WITH_SHERLOCK_HOLMES_URI } from '../constants.ts';

export function getDemoLinkByBookURI(bookURI: string): string {
  switch (bookURI) {
    case BOOK_MASTER_ENGLISH_WITH_SHERLOCK_HOLMES_URI:
      return `https://nikmas.studio/${BOOK_MASTER_ENGLISH_WITH_SHERLOCK_HOLMES_URI}/11111/demo`;
  }
    
  throw new Error(`No demo link defined for book URI: ${bookURI}`);
}