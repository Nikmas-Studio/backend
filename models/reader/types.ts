import { Branded, Email, UUID } from '../../types/global-types.ts';

export type ReaderId = Branded<UUID, 'ReaderId'>;

export interface Reader {
  id: ReaderId;
  email: Email;
  emailConfirmed: boolean;
  createdAt: Date;
}

export interface ReaderProfile {
  fullName: string | null;
  createdAt: Date;
}

export interface CreateOrUpdateReaderProfileDTO {
  fullName: string | null;
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
