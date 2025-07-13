import { AddTranslationDTO, GetTranslationDTO, Translation, TranslationId } from './types.ts';

export interface TranslationRepository {
  addTranslation(addTranslationDTO: AddTranslationDTO): Promise<Translation>;
  getTranslationByDetails(
    getTranslationDTO: GetTranslationDTO,
  ): Promise<Translation | null>;
  getTranslationById(translationId: TranslationId): Promise<Translation | null>;
}
