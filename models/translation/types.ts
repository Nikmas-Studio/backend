import { Branded, UUID } from '../../types/global-types.ts';
import { BookURI } from '../book/types.ts';

export interface AddTranslationDTO {
  bookURI: BookURI;
  targetLanguage: string;
  context: string;
  fragment: string;
  bookPart: string;
  translation: string;
}

export interface UpdateTranslationDTO {
  translationId: TranslationId;
  refinedTranslation: string;
  numberOfQualityChecks: number;
  lastQualityCheckAt: Date;
}

export interface GetTranslationDTO {
  bookURI: BookURI;
  targetLanguage: string;
  context: string;
  fragment: string;
  bookPart: string;
}

export type TranslationId = Branded<UUID, 'TranslationId'>;

export interface Translation {
  id: TranslationId;
  bookURI: BookURI;
  targetLanguage: string;
  context: string;
  fragment: string;
  bookPart: string;
  translation: string;
  lastQualityCheckAt: Date | null;
  numberOfQualityChecks: number;
}
