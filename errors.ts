import { ReaderEmail } from './models/reader/types.ts';

export class ReaderExistsError extends Error {
  constructor(email: ReaderEmail) {
    super(`Reader with email ${email} already exists`);
    this.name = 'ReaderExistsError';
  }
}
