import { Email } from '../../types/global-types.ts';
import {
  CreateOrUpdateReaderProfileDTO,
  CreateReaderDTO,
  Reader,
  ReaderId,
  ReaderProfile,
  ReaderStatuses,
} from './types.ts';

export interface ReaderRepository {
  getReaderByEmail(readerEmail: Email): Promise<Reader | null>;
  getReaderById(readerId: ReaderId): Promise<Reader | null>;

  /**
   * @throws {ReaderExistsError} if a reader with the given email already exists
   */
  createReader(createReaderDTO: CreateReaderDTO): Promise<Reader>;
  getOrCreateReader(createReaderDTO: CreateReaderDTO): Promise<Reader>;
  getReaderStatuses(readerId: ReaderId): Promise<ReaderStatuses | null>;
  confirmReaderEmail(readerId: ReaderId): Promise<void>;
  getAllReaders(): Promise<Reader[]>;
  removeReader(readerId: ReaderId): Promise<void>;
  createOrUpdateReaderProfile(
    readerId: ReaderId,
    createOrUpdateReaderProfileDTO: CreateOrUpdateReaderProfileDTO,
  ): Promise<ReaderProfile>;
  getReaderProfile(readerId: ReaderId): Promise<ReaderProfile | null>;
  updateReaderFullName(readerId: ReaderId, fullName: string): Promise<void>;
  setInvestorStatus(readerId: ReaderId, isInvestor: boolean): Promise<void>;
  setFullAccessStatus(readerEmail: ReaderId, hasFullAccess: boolean): Promise<void>;
}
