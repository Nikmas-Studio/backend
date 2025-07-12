import { Book } from '../../models/book/types.ts';
import { OrderId } from '../../models/subscription/types.ts';
import { Email } from '../../types/global-types.ts';

export interface GeneratePaymentLinkDto {
  readerEmail: Email;
  orderId: OrderId;
  book: Book;
  serviceURL: URL;
  regular: boolean;
}
