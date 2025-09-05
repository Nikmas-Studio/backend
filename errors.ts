import { SessionId } from './models/auth/types.ts';
import { BookId, BookURI } from './models/book/types.ts';
import { ReaderId } from './models/reader/types.ts';
import {
  OrderId,
  SubscriptionHistoryId,
  SubscriptionId,
} from './models/subscription/types.ts';
import { Email } from './types/global-types.ts';

export class ReaderExistsError extends Error {
  constructor(email: Email) {
    super(`reader with email ${email} already exists`);
    this.name = 'ReaderExistsError';
  }
}

export class ReaderNotFoundError extends Error {
  constructor(readerId: ReaderId) {
    super(`reader with id ${readerId} not found`);
    this.name = 'ReaderNotFoundError';
  }
}

export class RemoveReaderError extends Error {
  constructor(readerId: ReaderId) {
    super(`reader with id ${readerId} wasn't removed`);
    this.name = 'RemoveReaderError';
  }
}

export class SessionNotFoundError extends Error {
  constructor(sessionId: SessionId) {
    super(`sessioin with id ${sessionId} not found`);
    this.name = 'SessionNotFoundError';
  }
}

export class SendEmailError extends Error {
  constructor(recieverEmail: Email, originalError: Error) {
    super(`failed to send email to ${recieverEmail}`, {
      cause: originalError,
    });
    this.name = 'SendEmailError';
  }
}

export class PaymentLinkGenerationError extends Error {
  constructor(message: string, originalError?: Error) {
    super(message, {
      cause: originalError,
    });
    this.name = 'PaymentLinkGenerationError';
  }
}

export class BookExistsError extends Error {
  constructor(uri: BookURI) {
    super(`book with URI ${uri} already exists`);
    this.name = 'BookExistsError';
  }
}

export class BookNotFoundError extends Error {
  constructor(uri: BookURI) {
    super(`book with URI ${uri} not found`);
    this.name = 'BookNotFoundError';
  }
}

export class SubscriptionExistsError extends Error {
  constructor(orderId: OrderId) {
    super(`subscription with order id ${orderId} already exists`);
    this.name = 'SubscriptionExistsError';
  }
}

export class RemoveSubscriptionError extends Error {
  constructor(subscriptionId: SubscriptionId) {
    super(`subscription with id ${subscriptionId} wasn't removed`);
    this.name = 'RemoveSubscriptionError';
  }
}

export class RemoveSubscriptionHistoryError extends Error {
  constructor(subscriptionHistoryId: SubscriptionHistoryId) {
    super(
      `subscription history with id ${subscriptionHistoryId} wasn't removed`,
    );
    this.name = 'RemoveSubscriptionHistoryError';
  }
}

export class TranslationError extends Error {
  constructor(message: string, originalError?: Error) {
    super(message, {
      cause: originalError,
    });
    this.name = 'TranslationError';
  }
}

export class SubscriptionNotFoundError extends Error {
  constructor(subscriptionId: SubscriptionId) {
    super(`subscription with id ${subscriptionId} not found`);
    this.name = 'SubscriptionNotFoundError';
  }
}

export class TranslationCreditsObjectNotFoundError extends Error {
  constructor(
    connection: SubscriptionId | { readerId: ReaderId; bookId: BookId },
  ) {
    super(
      `translation credits object for connection ${
        JSON.stringify(connection)
      } not found`,
    );
    this.name = 'TranslationCreditsObjectNotFoundError';
  }
}
