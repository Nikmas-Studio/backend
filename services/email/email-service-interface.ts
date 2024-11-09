import { SendLoginLinkDTO } from './types.ts';

export interface EmailService {
  /**
   * @throws {SendLoginLinkEmailError} if the email could not be sent
   */
  sendLoginLink(sendLoginLinkDTO: SendLoginLinkDTO): Promise<void>;
}
