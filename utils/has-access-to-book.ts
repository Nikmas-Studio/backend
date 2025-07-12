import { Context } from 'hono';
import { AuthRepository } from '../models/auth/repository-interface.ts';
import { getAndValidateSession } from './get-and-validate-session.ts';
import { ReaderRepository } from '../models/reader/repository-interface.ts';
import { logError } from './logger.ts';
import { HTTPException } from 'hono/http-exception';
import { STATUS_CODE } from '@std/http/status';
import { SubscriptionRepository } from '../models/subscription/repository-interface.ts';
import { BookRepository } from '../models/book/repository-interface.ts';
import {
  Subscription,
  SubscriptionStatus,
} from '../models/subscription/types.ts';
import { ReaderId } from '../models/reader/types.ts';

export async function hasAccessToBook(
  c: Context,
  bookURI: string,
  authRepository: AuthRepository,
  readerRepository: ReaderRepository,
  subscriptionRepository: SubscriptionRepository,
  bookRepository: BookRepository,
): Promise<{
  accessGranted: boolean;
  readerId: ReaderId;
  subscription?: Subscription;
}> {
  const session = await getAndValidateSession(c, authRepository);
  const readerStatuses = await readerRepository.getReaderStatuses(
    session.readerId,
  );

  if (readerStatuses === null) {
    logError(`Reader statuses not found for readerId: ${session.readerId}`);
    throw new HTTPException(STATUS_CODE.InternalServerError);
  }

  if (readerStatuses.hasFullAccess) {
    return {
      accessGranted: true,
      readerId: session.readerId,
    };
  }

  const readerSubscriptions = await subscriptionRepository
    .getSubscriptionsByReaderId(session.readerId);

  for (const subscription of readerSubscriptions) {
    const book = await bookRepository.getBookById(subscription.bookId);
    if (book !== null) {
      if (
        book.uri === bookURI &&
        (subscription.status === SubscriptionStatus.ACTIVE ||
          (subscription.status === SubscriptionStatus.CANCELED &&
            subscription.accessExpiresAt !== undefined &&
            subscription.accessExpiresAt > new Date()))
      ) {
        return {
          readerId: session.readerId,
          accessGranted: true,
          subscription,
        };
      }
    }
  }

  return {
    accessGranted: false,
    readerId: session.readerId,
  };
}
