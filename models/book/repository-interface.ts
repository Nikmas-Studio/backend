import { Book, BookId, BookURI, CreateBookDTO } from './types.ts';

export interface BookRepository {
  createBook(CreateBookDTO: CreateBookDTO): Promise<Book>;
  getBookById(bookId: BookId): Promise<Book | null>;
  getBookByURI(bookURI: BookURI): Promise<Book | null>;
}
