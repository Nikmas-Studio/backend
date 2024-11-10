import { Email } from '../../global-types.ts';
import { Book } from '../../models/book/types.ts';
import { OrderId } from '../../models/subscription/types.ts';

export interface GeneratePaymentLinkDto {
  readerEmail: Email;
  orderId: OrderId;
  book: Book;
  returnURL: URL;
  serviceURL: URL;
}
