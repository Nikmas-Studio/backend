import { Branded, UUID } from '../../types/global-types.ts';

export type BookId = Branded<UUID, 'BookId'>;
export type BookTitle = string;
export type BookURI = string;
export type BookPrice = number;

export interface Book {
  id: BookId;
  title: BookTitle;
  uri: BookURI;
  mainPrice: BookPrice;
  createdAt: Date;
}

export interface CreateBookDTO {
  title: BookTitle;
  uri: BookURI;
  mainPrice: BookPrice;
}
