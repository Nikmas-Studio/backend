import { AddReaderToListDTO, SendLinkDTO, SendOrderSuccessLetterDTO } from './types.ts';

export interface EmailService {
  /**
   * @throws {SendLinkEmailError} if the email could not be sent
   */
  sendLink(sendLinkDTO: SendLinkDTO): Promise<void>;

  sendOrderSuccessLetter(
    sendOrderSuccessLetterDTO: SendOrderSuccessLetterDTO,
  ): Promise<void>;
  
  addReaderToList(addReaderToListDTO: AddReaderToListDTO): Promise<void>;
}
