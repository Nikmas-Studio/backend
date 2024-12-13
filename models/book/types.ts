import { Branded, UUID } from '../../types/global-types.ts';

export type BookId = Branded<UUID, 'BookId'>;
export type BookTitle = string;
export type BookURI = string;
export type BookMainPrice = number;

export interface Book {
  id: BookId;
  title: BookTitle;
  uri: BookURI;
  mainPrice: BookMainPrice;
  createdAt: Date;
}

export interface CreateBookDTO {
  title: BookTitle;
  uri: BookURI;
  mainPrice: BookMainPrice;
}
