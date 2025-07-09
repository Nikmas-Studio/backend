import { ALLOWED_TEXT } from '../allowed-demo-translation-texts/master-english-with-sherlock-holmes.ts';
import {
  BOOK_MASTER_ENGLISH_WITH_SHERLOCK_HOLMES_URI,
  LANGUAGE_MAPPINGS,
} from '../constants.ts';

interface AllowTranslationParams {
  bookURI: string;
  targetLanguage: string;
  context: string;
  fragment: string;
}

export function allowTranslation(
  { bookURI, targetLanguage, context, fragment }: AllowTranslationParams,
): boolean {
  if (LANGUAGE_MAPPINGS[targetLanguage] === undefined) {
    return false;
  }

  console.log('context:', context);
  console.log('fragment:', fragment);
  // console.log('ALLOWED_TEXT:', ALLOWED_TEXT);

  if (bookURI === BOOK_MASTER_ENGLISH_WITH_SHERLOCK_HOLMES_URI) {
    if (
      ALLOWED_TEXT.includes(fragment) &&
      ALLOWED_TEXT.includes(context)
    ) {
      return true;
    }
  }

  return false;
}
