import { STATUS_CODE } from '@std/http/status';
import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { AuthRepository } from '../models/auth/repository-interface.ts';
import { BookRepository } from '../models/book/repository-interface.ts';
import { ReaderRepository } from '../models/reader/repository-interface.ts';
import { ReaderId } from '../models/reader/types.ts';
import { SubscriptionRepository } from '../models/subscription/repository-interface.ts';
import {
OrderId,
  Subscription,
  SubscriptionStatus,
} from '../models/subscription/types.ts';
import { getAndValidateSession } from './get-and-validate-session.ts';
import { logError } from './logger.ts';

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
  orderIdToRemoveRegularPayment?: OrderId;
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
    
  let orderIdToRemoveRegularPayment;

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
      } else if (
        subscription.status === SubscriptionStatus.CANCELED &&
        subscription.accessExpiresAt !== undefined &&
        subscription.accessExpiresAt <= new Date()
      ) {
        orderIdToRemoveRegularPayment = subscription.orderId;
      }
    }
  }

  return {
    accessGranted: false,
    readerId: session.readerId,
    orderIdToRemoveRegularPayment,
  };
}
