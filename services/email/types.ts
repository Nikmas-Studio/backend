import { Email } from '../../global-types.ts';

export type EmailSubject = string;
export type EmailBody = string;

export interface SendLinkDTO {
  readerEmail: Email;
  link: URL;
  linkType: LinkType;
}

export interface SendOrderSuccessLetterDTO {
  readerEmail: Email;
}

export enum LinkType {
  LOGIN = 'LOGIN',
  PAYMENT = 'PAYMENT',
}
