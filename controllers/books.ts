import { Context } from 'hono';
import { BookRepository } from '../models/book/repository-interface.ts';
import { TypedResponse } from 'hono';
import { AuthRepository } from '../models/auth/repository-interface.ts';
import { getAndValidateSession } from '../utils/get-and-validate-session.ts';
import { SubscriptionRepository } from '../models/subscription/repository-interface.ts';
import { SubscriptionStatus } from '../models/subscription/types.ts';
import { STATUS_CODE } from '@std/http';
import { ReaderRepository } from '../models/reader/repository-interface.ts';
import { HTTPException } from 'hono/http-exception';
import { logError } from '../utils/logger.ts';

export class BooksController {
  constructor(
    private authRepository: AuthRepository,
    private subscriptionRepository: SubscriptionRepository,
    private bookRepository: BookRepository,
    private readerRepository: ReaderRepository,
  ) {}

  async checkAccessToBook(c: Context): Promise<TypedResponse> {
    const bookURI = c.req.param('uri');
    const session = await getAndValidateSession(c, this.authRepository);
    const readerStatuses = await this.readerRepository.getReaderStatuses(
      session.readerId,
    );

    if (readerStatuses === null) {
      logError(`Reader statuses not found for readerId: ${session.readerId}`);
      throw new HTTPException(STATUS_CODE.InternalServerError);
    }

    if (readerStatuses.hasFullAccess) {
      return c.json({
        accessGranted: true,
      }, STATUS_CODE.OK);
    }

    const readerSubscriptions = await this.subscriptionRepository
      .getSubscriptionsByReaderId(session.readerId);

    for (const subscription of readerSubscriptions) {
      const book = await this.bookRepository.getBookById(subscription.bookId);
      if (book !== null) {
        if (
          book.uri === bookURI &&
          subscription.status === SubscriptionStatus.ACTIVE
        ) {
          return c.json({
            accessGranted: true,
          }, STATUS_CODE.OK);
        }
      }
    }

    return c.json({
      accessGranted: false,
    }, STATUS_CODE.OK);
  }
}
