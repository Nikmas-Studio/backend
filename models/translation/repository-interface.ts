import { AddTranslationDTO, GetTranslationDTO, Translation } from './types.ts';

export interface TranslationRepository {
  addTranslation(addTranslationDTO: AddTranslationDTO): Promise<Translation>;
  getTranslation(getTranslationDTO: GetTranslationDTO): Promise<Translation | null>; 
}