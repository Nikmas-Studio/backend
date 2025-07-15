import { RefineTranslationDTO, TranslateDTO, Translation } from './types.ts';

export interface TranslationService {
  translate(
    translateDTO: TranslateDTO,
  ): Promise<Translation>;

  refineTranslation(
    refineTranslationDTO: RefineTranslationDTO,
  ): Promise<Translation>;
}
