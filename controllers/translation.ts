import { STATUS_CODE } from '@std/http';
import { Context, TypedResponse } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { TranslationRepository } from '../models/translation/repository-interface.ts';
import { TranslateDTO } from '../routes-dtos/translate.ts';
import { TranslationService } from '../services/translation/translation-service-interface.ts';
import { allowTranslation } from '../utils/allow-translation-master-english-with-sherlock-holmes.ts';
import { normalizeTranslationPiece } from '../utils/normalize-translation-piece.ts';
import { hasAccessToBook } from '../utils/has-access-to-book.ts';
import { AuthRepository } from '../models/auth/repository-interface.ts';
import { SubscriptionRepository } from '../models/subscription/repository-interface.ts';
import { BookRepository } from '../models/book/repository-interface.ts';
import { ReaderRepository } from '../models/reader/repository-interface.ts';
import { checkAndUpdateTranslationCredits } from '../utils/check-and-update-translation-credits.ts';
import { TRANSLATION_CREDITS_TO_GRANT_ON_UPDATE_MASTER_ENGLISH_WITH_SHERLOCK_HOLMES } from '../constants.ts';

export class TranslationController {
  constructor(
    private translationService: TranslationService,
    private translationRepository: TranslationRepository,
    private authRepository: AuthRepository,
    private subscriptionRepository: SubscriptionRepository,
    private bookRepository: BookRepository,
    private readerRepository: ReaderRepository,
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
    const { accessGranted, subscription, readerId } = await hasAccessToBook(
      c,
      bookURI,
      this.authRepository,
      this.readerRepository,
      this.subscriptionRepository,
      this.bookRepository,
    );

    if (!accessGranted) {
      throw new HTTPException(
        STATUS_CODE.Forbidden,
        {
          message: 'Access to book is forbidden',
        },
      );
    }

    const book = await this.bookRepository.getBookByURI(bookURI);
    if (book === null) {
      throw new HTTPException(
        STATUS_CODE.NotFound,
        {
          message: 'Book not found',
        },
      );
    }

    checkAndUpdateTranslationCredits(
      fragment,
      context,
      targetLanguage,
      subscription === undefined ? { readerId, bookId: book.id } : subscription.id,
      this.subscriptionRepository,
      TRANSLATION_CREDITS_TO_GRANT_ON_UPDATE_MASTER_ENGLISH_WITH_SHERLOCK_HOLMES,
    );

    fragment = normalizeTranslationPiece(fragment);
    context = normalizeTranslationPiece(context);

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
    fragment = normalizeTranslationPiece(fragment);
    context = normalizeTranslationPiece(context);

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
