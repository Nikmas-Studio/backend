import { SendLinkDTO } from './types.ts';

export interface EmailService {
  /**
   * @throws {SendLinkEmailError} if the email could not be sent
   */
  sendLink(sendLinkDTO: SendLinkDTO): Promise<void>;
}
