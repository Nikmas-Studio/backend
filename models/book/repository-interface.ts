import { ReaderId } from '../reader/types.ts';
import { Book, BookId, BookPrice, BookURI, CreateBookDTO } from './types.ts';

export interface BookRepository {
  createBook(newBook: CreateBookDTO): Promise<Book>;
  updateBookPrice(bookURI: BookURI, newPrice: BookPrice): Promise<Book>;
  getBookById(bookId: BookId): Promise<Book | null>;
  getBookByURI(bookURI: BookURI): Promise<Book | null>;
  startDemoFlow(bookURI: BookURI, readerId: ReaderId): Promise<void>;
  demoFlowStarted(bookURI: BookURI, readerId: ReaderId): Promise<boolean>;
  assignLastVisitedPage(
    bookURI: BookURI,
    readerId: ReaderId,
    page: string,
  ): Promise<void>;
  getLastVisitedPage(
    bookURI: BookURI,
    readerId: ReaderId,
  ): Promise<string | null>;
}
