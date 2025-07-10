import { Context } from 'hono';
import { BookRepository } from '../models/book/repository-interface.ts';
import { TypedResponse } from 'hono';
import { AuthRepository } from '../models/auth/repository-interface.ts';
import { SubscriptionRepository } from '../models/subscription/repository-interface.ts';
import { STATUS_CODE } from '@std/http';
import { ReaderRepository } from '../models/reader/repository-interface.ts';
import { hasAccessToBook } from '../utils/hasAccessToBook.ts';
import { SubscriptionStatus } from '../models/subscription/types.ts';

export class BooksController {
  constructor(
    private authRepository: AuthRepository,
    private subscriptionRepository: SubscriptionRepository,
    private bookRepository: BookRepository,
    private readerRepository: ReaderRepository,
  ) {}

  async checkAccessToBook(c: Context): Promise<TypedResponse> {
    const bookURI = c.req.param('uri');
    const {accessGranted, subscription} = await hasAccessToBook(
      c,
      bookURI,
      this.authRepository,
      this.readerRepository,
      this.subscriptionRepository,
      this.bookRepository,
    );

    const response = {
      accessGranted,
      paidUntil: subscription?.accessExpiresAt,
      subscriptionIsActive: subscription?.status === SubscriptionStatus.ACTIVE || accessGranted,
    };

    return c.json(response, STATUS_CODE.OK);
  }
}
