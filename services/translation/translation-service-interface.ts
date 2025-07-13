import { TranslateDTO, Translation } from './types.ts';

export interface TranslationService {
  /**
   * @throws {TranslationError}
   */
  translate(
    translateDTO: TranslateDTO,
  ): Promise<Translation>;
}
