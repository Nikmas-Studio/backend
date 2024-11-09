import { Email } from '../../general-types.ts';

export type EmailSubject = string;
export type EmailBody = string;

export interface SendEmailDTO {
  recieverEmail: Email;
  subject: EmailSubject;
  body: EmailBody;
}
