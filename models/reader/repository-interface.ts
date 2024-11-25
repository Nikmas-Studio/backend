import { Email } from '../../global-types.ts';
import { CreateReaderDTO, Reader, ReaderId, ReaderStatuses } from './types.ts';

export interface ReaderRepository {
  getReaderByEmail(readerEmail: Email): Promise<Reader | null>;
  getReaderById(readerId: ReaderId): Promise<Reader | null>;

  /**
   * @throws {ReaderExistsError} if a reader with the given email already exists
   */
  createReader(createReaderDTO: CreateReaderDTO): Promise<Reader>;
  getOrCreateReader(createReaderDTO: CreateReaderDTO): Promise<Reader>;
  getReaderStatuses(readerId: ReaderId): Promise<ReaderStatuses | null>;
}
