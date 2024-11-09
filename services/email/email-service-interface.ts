import { SendLoginLinkDTO } from './types.ts';

export interface EmailService {
  sendLoginLink(sendLoginLinkDTO: SendLoginLinkDTO): Promise<void>;
}