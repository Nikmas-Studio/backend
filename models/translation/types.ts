import { Branded, UUID } from '../../types/global-types.ts';
import { BookURI } from '../book/types.ts';

export interface AddTranslationDTO {
  bookURI: BookURI;
  targetLanguage: string;
  context: string;
  fragment: string;
  story: string;
  translation: string;
}

export interface GetTranslationDTO {
  bookURI: BookURI;
  targetLanguage: string;
  context: string;
  fragment: string;
  story: string;
}

export type TranslationId = Branded<UUID, 'TranslationId'>;

export interface Translation {
  id: TranslationId;
  bookURI: BookURI;
  targetLanguage: string;
  context: string;
  fragment: string;
  story: string;
  translation: string;
  lastQualityCheckAt: Date | null;
  numberOfQualityChecks: number;
}
