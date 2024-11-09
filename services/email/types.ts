import { Email } from '../../general-types.ts';

export type EmailSubject = string;
export type EmailBody = string;

export interface SendLoginLinkDTO {
  recieverEmail: Email;
  link: URL;
}
