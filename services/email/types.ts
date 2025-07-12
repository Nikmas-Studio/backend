import { Email } from '../../types/global-types.ts';

export type EmailSubject = string;
export type EmailBody = string;

export interface SendLinkDTO {
  readerEmail: Email;
  link: URL;
  linkType: LinkType;
}

export interface SendDemoLinkDTO {
  readerEmail: Email;
  demoLink: URL;
  promoLink: URL;
  bookTitle: string;
}

export interface SendOneTimePurchaseSuccessLetterDTO {
  readerEmail: Email;
}

export interface SendSubscriptionSuccessLetterDTO {
  readerEmail: Email;
  bookTitle: string;
  promoLink: URL;
  paidUntil: string;
}

export interface AddReaderToListDTO {
  readerEmail: Email;
  listId: number;
}

export enum LinkType {
  LOGIN = 'LOGIN',
  PAYMENT = 'PAYMENT',
}
