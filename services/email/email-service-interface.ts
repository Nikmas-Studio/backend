import {
  AddReaderToListDTO,
  SendDemoLinkDTO,
  SendLinkDTO,
  SendOneTimePurchaseSuccessLetterDTO,
  SendSubscriptionSuccessLetterDTO,
} from './types.ts';

export interface EmailService {
  /**
   * @throws {SendLinkEmailError} if the email could not be sent
   */
  sendLink(sendLinkDTO: SendLinkDTO): Promise<void>;

  sendDemoLink(sendDemoLinkDTO: SendDemoLinkDTO): Promise<void>;

  sendOneTimePurchaseSuccessLetter(
    sendOneTimePurchaseLetterDTO: SendOneTimePurchaseSuccessLetterDTO,
  ): Promise<void>;
  
  sendSubscriptionSuccessLetter(
    sendSubscriptionSuccessLetterDTO: SendSubscriptionSuccessLetterDTO,
  ): Promise<void>;

  addReaderToList(addReaderToListDTO: AddReaderToListDTO): Promise<void>;
}
