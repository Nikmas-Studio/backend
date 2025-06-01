import { Email } from './types/global-types.ts';
import { SessionId } from './models/auth/types.ts';
import { BookURI } from './models/book/types.ts';
import { ReaderId } from './models/reader/types.ts';
import { OrderId, SubscriptionHistoryId, SubscriptionId } from './models/subscription/types.ts';

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

export class SendLinkEmailError extends Error {
  constructor(recieverEmail: Email, originalError: Error) {
    super(`failed to send login link email to ${recieverEmail}`, {
      cause: originalError,
    });
    this.name = 'SendLoginLinkEmailError';
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
    super(`subscription history with id ${subscriptionHistoryId} wasn't removed`);
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