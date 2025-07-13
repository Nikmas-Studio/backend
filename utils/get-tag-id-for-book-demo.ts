import {
  BOOK_MASTER_ENGLISH_WITH_SHERLOCK_HOLMES_URI,
  SENDPULSE_DEMO_MASTER_ENGLISH_WITH_SHERLOCK_HOLMES_TAG_ID,
} from '../constants.ts';

export function getTagIdForBookDemo(bookURI: string): number {
  switch (bookURI) {
    case BOOK_MASTER_ENGLISH_WITH_SHERLOCK_HOLMES_URI:
      return SENDPULSE_DEMO_MASTER_ENGLISH_WITH_SHERLOCK_HOLMES_TAG_ID;
    default:
      throw new Error(`No tag ID defined for book URI: ${bookURI}`);
  }
}
