import { Branded, Email, UUID } from '../../global-types.ts';

export type ReaderId = Branded<UUID, 'ReaderId'>;

export interface Reader {
  id: ReaderId;
  email: Email;
  emailConfirmed: boolean;
  createdAt: Date;
}

export interface ReaderProfile {
  fullName: string;
  createdAt: Date;
}

export interface CreateOrUpdateReaderProfileDTO {
  fullName: string;
}

export interface ReaderStatuses {
  isInvestor: boolean;
  hasFullAccess: boolean;
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
