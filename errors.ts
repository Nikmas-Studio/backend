import { Email } from './global-types.ts';

export class ReaderExistsError extends Error {
  constructor(email: Email) {
    super(`Reader with email ${email} already exists`);
    this.name = 'ReaderExistsError';
  }
}

export class SendLoginLinkEmailError extends Error {
  constructor(recieverEmail: Email, originalError: Error) {
    super(`Failed to send login link email to ${recieverEmail}`, {
      cause: originalError,
    });
    this.name = 'SendLoginLinkEmailError';
  }
}
