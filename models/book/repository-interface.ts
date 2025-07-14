import { ReaderId } from '../reader/types.ts';
import { Book, BookId, BookURI, CreateBookDTO } from './types.ts';

export interface BookRepository {
  createBook(CreateBookDTO: CreateBookDTO): Promise<Book>;
  getBookById(bookId: BookId): Promise<Book | null>;
  getBookByURI(bookURI: BookURI): Promise<Book | null>;
  startDemoFlow(bookURI: BookURI, readerId: ReaderId): Promise<void>;
  demoFlowStarted(bookURI: BookURI, readerId: ReaderId): Promise<boolean>;
  assignLastVisitedPage(bookURI: BookURI, readerId: ReaderId, page: string): Promise<void>;
}
