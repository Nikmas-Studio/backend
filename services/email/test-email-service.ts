import { EmailService } from './email-service-interface.ts';
import { SendLinkDTO } from './types.ts';

export class TestEmailService implements EmailService {
  sendLink(_sendLoginLinkDTO: SendLinkDTO): Promise<void> {
    return Promise.resolve();
  }
}
