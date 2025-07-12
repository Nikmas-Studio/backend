import { EmailService } from './email-service-interface.ts';
import {
  SendDemoLinkDTO,
  SendLinkDTO,
  SendOneTimePurchaseSuccessLetterDTO,
  SendSubscriptionSuccessLetterDTO,
} from './types.ts';

export class TestEmailService implements EmailService {
  sendSubscriptionSuccessLetter(
    _sendSubscriptionSuccessLetterDTO: SendSubscriptionSuccessLetterDTO,
  ): Promise<void> {
    return Promise.resolve();
  }

  sendDemoLink(_sendDemoLinkDTO: SendDemoLinkDTO): Promise<void> {
    return Promise.resolve();
  }

  sendOneTimePurchaseSuccessLetter(
    _sendOrderSuccessLetterDTO: SendOneTimePurchaseSuccessLetterDTO,
  ): Promise<void> {
    return Promise.resolve();
  }

  sendLink(_sendLoginLinkDTO: SendLinkDTO): Promise<void> {
    return Promise.resolve();
  }

  addReaderToList(): Promise<void> {
    return Promise.resolve();
  }
}
