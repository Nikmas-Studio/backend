import { ReaderId } from '../reader/types.ts';
import {
  AddTranslationDTO,
  GetTranslationDTO,
  Translation,
  TranslationId,
} from './types.ts';

export interface TranslationRepository {
  addTranslation(addTranslationDTO: AddTranslationDTO): Promise<Translation>;
  getTranslationByDetails(
    getTranslationDTO: GetTranslationDTO,
  ): Promise<Translation | null>;
  getTranslationById(translationId: TranslationId): Promise<Translation | null>;
  saveReaderTranslation(
    translationId: TranslationId,
    readerId: ReaderId,
  ): Promise<void>;
}
