import { Email } from '../../general-types.ts';
import { CreateReaderDTO, Reader } from './types.ts';

export interface ReaderRepository {
  getReaderByEmail(email: Email): Promise<Reader | null>;

  /**
   * @throws {ReaderExistsError} if a reader with the given email already exists
   */
  createReader(createReaderDTO: CreateReaderDTO): Promise<Reader>;
  getOrCreateReader(createReaderDTO: CreateReaderDTO): Promise<Reader>;
}
