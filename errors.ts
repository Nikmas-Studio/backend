import { Email } from './global-types.ts';
import { BookURI } from './models/book/types.ts';
import { OrderId } from './models/subscription/types.ts';

export class ReaderExistsError extends Error {
  constructor(email: Email) {
    super(`reader with email ${email} already exists`);
    this.name = 'ReaderExistsError';
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
