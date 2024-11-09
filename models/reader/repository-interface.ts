import { CreateReaderDTO, Reader, ReaderEmail } from './types.ts';

export interface ReaderRepository {
  getReaderByEmail(email: ReaderEmail): Promise<Reader | null>;
  createReader(createReaderDTO: CreateReaderDTO): Promise<Reader>;
  getOrCreateReader(createReaderDTO: CreateReaderDTO): Promise<Reader>;
}
