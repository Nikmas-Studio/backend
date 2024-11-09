import { EmailService } from './email-service-interface.ts';
import { SendEmailDTO } from './types.ts';

export class AWSSESEmailService implements EmailService {
  sendEmail(_SendEmailDTO: SendEmailDTO): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
