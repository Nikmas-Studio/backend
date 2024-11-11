import { Branded, Email, UUID } from '../../global-types.ts';

export type ReaderId = Branded<UUID, 'ReaderId'>;

export interface Reader {
  id: ReaderId;
  email: Email;
  createdAt: Date;
}

export interface Investor {
  readerId: ReaderId;
  createdAt: Date;
}

export interface FullAccessReader {
  readerId: ReaderId;
  createdAt: Date;
}

export interface CreateReaderDTO {
  email: Email;
  isInvestor: boolean;
  hasFullAccess: boolean;
}

export enum ReaderStatus {
  GUEST = 'GUEST',
  AUTHENTICATED = 'AUTHENTICATED',
}
