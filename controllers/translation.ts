import { STATUS_CODE } from '@std/http';
import { Context, TypedResponse } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { TranslationRepository } from '../models/translation/repository-interface.ts';
import { TranslateDTO } from '../routes-dtos/translate.ts';
import { TranslationService } from '../services/translation/translation-service-interface.ts';

export class TranslationController {
  constructor(
    private translationService: TranslationService,
    private translationRepository: TranslationRepository,
  ) {}

  async translate(
    c: Context,
    {
      bookURI,
      targetLanguage,
      context,
      fragment,
    }: TranslateDTO,
  ): Promise<TypedResponse> {
    let translationObj = await this.translationRepository.getTranslation({
      bookURI,
      targetLanguage,
      fragment,
      context,
    });

    if (translationObj === null) {
      try {
        const newTranslation = await this.translationService.translate({
          targetLanguage,
          context,
          fragment,
        });

        translationObj = await this.translationRepository.addTranslation({
          bookURI,
          targetLanguage,
          context,
          fragment,
          translation: newTranslation,
        });
      } catch (_) {
        throw new HTTPException(STATUS_CODE.InternalServerError);
      }
    } else {
      console.log('Cache hit for translation:', translationObj);
    }

    return c.json({
      translation: translationObj.translation,
    }, STATUS_CODE.OK);
  }
}
