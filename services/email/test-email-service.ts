import { EmailService } from './email-service-interface.ts';
import { SendLoginLinkDTO } from './types.ts';

export class TestEmailService implements EmailService {
  sendLoginLink(_sendLoginLinkDTO: SendLoginLinkDTO): Promise<void> {
    return Promise.resolve();
  }
}
