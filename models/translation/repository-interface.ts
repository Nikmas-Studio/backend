import { ReaderId } from '../reader/types.ts';
import {
  AddTranslationDTO,
  GetTranslationDTO,
  Translation,
  TranslationId,
  UpdateTranslationDTO,
} from './types.ts';

export interface TranslationRepository {
  addTranslation(addTranslationDTO: AddTranslationDTO): Promise<Translation>;
  updateTranslation(udpateTranslationDTO: UpdateTranslationDTO): Promise<Translation>;
  getTranslationByDetails(
    getTranslationDTO: GetTranslationDTO,
  ): Promise<Translation | null>;
  getTranslationById(translationId: TranslationId): Promise<Translation | null>;
  saveReaderTranslation(
    translationId: TranslationId,
    readerId: ReaderId,
  ): Promise<void>;
}
