import { STATUS_CODE } from '@std/http';
import { Context, TypedResponse } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { TranslationRepository } from '../models/translation/repository-interface.ts';
import { TranslateDTO } from '../routes-dtos/translate.ts';
import { TranslationService } from '../services/translation/translation-service-interface.ts';
import { allowTranslation } from '../utils/allow-translation.ts';

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
      bookPart,
    }: TranslateDTO,
  ): Promise<TypedResponse> {
    fragment = fragment.replaceAll(/[\n\r]/g, ' ').trim().replace(/ {2,}/g, ' ')
      .replace(/”“/g, '” “').replace(/\u00A0/g, ' ').replace(/\.“/g, '. “')
      .replace(/”(\S)/g, '” $1').replace(/\.([a-zA-Z])/g, '. $1').replace(/\u2060/g, '');

    context = context.replaceAll(/[\n\r]/g, ' ').trim().replace(/ {2,}/g, ' ')
      .replace(/”“/g, '” “').replace(/\u00A0/g, ' ').replace(/\.“/g, '. “')
      .replace(/”(\S)/g, '” $1').replace(/\.([a-zA-Z])/g, '. $1').replace(/\u2060/g, '');

    let translationObj = await this.translationRepository
      .getTranslationByDetails({
        bookURI,
        targetLanguage,
        fragment,
        context,
        bookPart,
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
          bookPart,
          translation: newTranslation,
        });
      } catch (_) {
        throw new HTTPException(STATUS_CODE.InternalServerError);
      }
    }

    return c.json({
      translation: translationObj.translation,
    }, STATUS_CODE.OK);
  }

  async translateDemo(
    c: Context,
    {
      bookURI,
      targetLanguage,
      context,
      fragment,
      bookPart,
    }: TranslateDTO,
  ): Promise<TypedResponse> {
    fragment = fragment.replaceAll(/[\n\r]/g, ' ').trim().replace(/ {2,}/g, ' ')
      .replace(/”“/g, '” “').replace(/\u00A0/g, ' ').replace(/\.“/g, '. “')
      .replace(/”(\S)/g, '” $1').replace(/\.([a-zA-Z])/g, '. $1').replace(/\u2060/g, '');

    context = context.replaceAll(/[\n\r]/g, ' ').trim().replace(/ {2,}/g, ' ')
      .replace(/”“/g, '” “').replace(/\u00A0/g, ' ').replace(/\.“/g, '. “')
      .replace(/”(\S)/g, '” $1').replace(/\.([a-zA-Z])/g, '. $1').replace(/\u2060/g, '');

    if (
      !allowTranslation({
        bookURI,
        targetLanguage,
        context,
        fragment,
      })
    ) {
      throw new HTTPException(
        STATUS_CODE.BadRequest,
        {
          message: 'Translation not allowed',
        },
      );
    }

    let translationObj = await this.translationRepository
      .getTranslationByDetails({
        bookURI,
        targetLanguage,
        fragment,
        context,
        bookPart,
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
          bookPart,
          translation: newTranslation,
        });
      } catch (_) {
        throw new HTTPException(STATUS_CODE.InternalServerError);
      }
    }

    return c.json({
      translation: translationObj.translation,
    }, STATUS_CODE.OK);
  }
}
