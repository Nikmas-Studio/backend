import { BookExistsError } from '../../errors.ts';
import { generateUUID } from '../../utils/generate-uuid.ts';
import { logInfo } from '../../utils/logger.ts';
import { BookRepository } from './repository-interface.ts';
import { Book, BookId, BookURI, CreateBookDTO } from './types.ts';

export class BookDenoKvRepository implements BookRepository {
  constructor(private kv: Deno.Kv) {}

  async createBook({ title, uri, mainPrice }: CreateBookDTO): Promise<Book> {
    const book: Book = {
      id: generateUUID() as BookId,
      title,
      uri,
      mainPrice,
      createdAt: new Date(),
    };

    const primaryKey = ['books', book.id];
    const byURIKey = ['books_by_uri', book.uri];

    const res = await this.kv.atomic()
      .check({ key: byURIKey, versionstamp: null })
      .set(primaryKey, book)
      .set(byURIKey, book.id)
      .commit();

    if (!res.ok) {
      throw new BookExistsError(book.uri);
    }

    logInfo(`book created: ${JSON.stringify(book)}`);

    return book;
  }

  async getBookById(bookId: BookId): Promise<Book | null> {
    const book = await this.kv.get<Book>(['books', bookId]);
    return book.value;
  }

  async getBookByURI(bookURI: BookURI): Promise<Book | null> {
    const bookId = await this.kv.get<BookId>(['books_by_uri', bookURI]);

    if (bookId.value === null) {
      return null;
    }

    return this.getBookById(bookId.value);
  }
}
