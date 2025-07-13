import {
  AddReaderToListDTO,
  SendDemoLinkDTO,
  SendLoginLinkDTO,
  SendOneTimePurchaseSuccessLetterDTO,
  SendPaymentLinkDTO,
  SendSubscriptionSuccessLetterDTO,
} from './types.ts';

export interface EmailService {
  sendLoginLink(sendLinkDTO: SendLoginLinkDTO): Promise<void>;

  sendPaymentLink(sendPaymentLinkDTO: SendPaymentLinkDTO): Promise<void>;

  sendDemoLink(sendDemoLinkDTO: SendDemoLinkDTO): Promise<void>;

  sendOneTimePurchaseSuccessLetter(
    sendOneTimePurchaseLetterDTO: SendOneTimePurchaseSuccessLetterDTO,
  ): Promise<void>;
  
  sendSubscriptionSuccessLetter(
    sendSubscriptionSuccessLetterDTO: SendSubscriptionSuccessLetterDTO,
  ): Promise<void>;

  addReaderToList(addReaderToListDTO: AddReaderToListDTO): Promise<void>;
}
