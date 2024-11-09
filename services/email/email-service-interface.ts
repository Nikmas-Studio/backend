import { SendEmailDTO } from './types.ts';

export interface EmailService {
  sendEmail(SendEmailDTO: SendEmailDTO): Promise<void>;
}
