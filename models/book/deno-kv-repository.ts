import { BookExistsError, BookNotFoundError } from '../../errors.ts';
import { generateUUID } from '../../utils/generate-uuid.ts';
import { logInfo } from '../../utils/logger.ts';
import { ReaderId } from '../reader/types.ts';
import { BookRepository } from './repository-interface.ts';
import { Book, BookId, BookPrice, BookURI, CreateBookDTO } from './types.ts';

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

  async updateBookPrice(bookURI: BookURI, newPrice: BookPrice): Promise<Book> {
    const book = await this.getBookByURI(bookURI);

    if (book === null) {
      throw new BookNotFoundError(bookURI);
    }
    
    const updatedBook: Book = { ...book, mainPrice: newPrice };
    await this.kv.set(['books', book.id], updatedBook);
    
    return updatedBook;
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

  async startDemoFlow(bookURI: BookURI, readerId: ReaderId): Promise<void> {
    const key = ['demo_flow_started', bookURI, readerId];
    await this.kv.set(key, true);
  }

  async demoFlowStarted(
    bookURI: BookURI,
    readerId: ReaderId,
  ): Promise<boolean> {
    const key = ['demo_flow_started', bookURI, readerId];
    const res = await this.kv.get<boolean>(key);
    return res.value === null ? false : res.value;
  }

  async assignLastVisitedPage(
    bookURI: BookURI,
    readerId: ReaderId,
    page: string,
  ): Promise<void> {
    const key = ['last_visited_page', bookURI, readerId];
    await this.kv.set(key, page);
  }

  async getLastVisitedPage(
    bookURI: BookURI,
    readerId: ReaderId,
  ): Promise<string | null> {
    const key = ['last_visited_page', bookURI, readerId];
    const res = await this.kv.get<string>(key);
    return res.value;
  }
}
