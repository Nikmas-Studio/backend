import { EmailService } from './email-service-interface.ts';
import { SendLinkDTO, SendOrderSuccessLetterDTO } from './types.ts';

export class TestEmailService implements EmailService {
  sendOrderSuccessLetter(_sendOrderSuccessLetterDTO: SendOrderSuccessLetterDTO): Promise<void> {
    return Promise.resolve();
  }

  sendLink(_sendLoginLinkDTO: SendLinkDTO): Promise<void> {
    return Promise.resolve();
  }

  addReaderToList(): Promise<void> {
    return Promise.resolve();
  }
}
