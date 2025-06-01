import { BookURI } from '../book/types.ts';

export interface AddTranslationDTO {
  bookURI: BookURI;
  targetLanguage: string;
  context: string;
  fragment: string;
  translation: string;
}

export interface GetTranslationDTO {
  bookURI: BookURI;
  targetLanguage: string;
  context: string;
  fragment: string;
}

export interface Translation {
  bookURI: BookURI;
  targetLanguage: string;
  context: string;
  fragment: string;
  translation: string;
  lastCheckedAt: Date;
  numberOfQualityChecks: number;
}
