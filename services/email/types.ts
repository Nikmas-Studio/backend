import { Email } from '../../global-types.ts';

export type EmailSubject = string;
export type EmailBody = string;

export interface SendLoginLinkDTO {
  readerEmail: Email;
  link: URL;
}
