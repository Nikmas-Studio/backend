import { EmailService } from './email-service-interface.ts';
import {
  SendDemoLinkDTO,
  SendLoginLinkDTO,
  SendOneTimePurchaseSuccessLetterDTO,
  SendPaymentLinkDTO,
  SendSubscriptionSuccessLetterDTO,
} from './types.ts';

export class TestEmailService implements EmailService {
  sendLoginLink(_sendLinkDTO: SendLoginLinkDTO): Promise<void> {
    return Promise.resolve();
  }
  sendPaymentLink(_sendPaymentLinkDTO: SendPaymentLinkDTO): Promise<void> {
    return Promise.resolve();
  }

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

  addReaderToList(): Promise<void> {
    return Promise.resolve();
  }
}
