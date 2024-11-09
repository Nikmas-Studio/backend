import {
  SendTemplatedEmailCommand,
  SESClient,
} from 'https://esm.sh/@aws-sdk/client-ses@3.687.0';
import { LOGIN_LINK_TEMPLATE_NAME, STUDIO_EMAIL } from '../../constants.ts';
import { getAWSSESClientConfig } from '../../utils/get-aws-ses-client-config.ts';
import { EmailService } from './email-service-interface.ts';
import { SendLoginLinkDTO } from './types.ts';
import { SendLoginLinkEmailError } from '../../errors.ts';

export class AWSSESEmailService implements EmailService {
  private client: SESClient;

  constructor() {
    this.client = new SESClient(getAWSSESClientConfig());
  }

  async sendLoginLink(
    { recieverEmail, link }: SendLoginLinkDTO,
  ): Promise<void> {
    const sendEmailCommand = new SendTemplatedEmailCommand({
      Source: STUDIO_EMAIL,
      Destination: {
        ToAddresses: [recieverEmail],
      },
      Template: LOGIN_LINK_TEMPLATE_NAME,
      TemplateData: JSON.stringify({ link }),
    });

    try {
      await this.client.send(sendEmailCommand);
    } catch (e) {
      console.log('Failed to send login link email to', recieverEmail, e);
      throw new SendLoginLinkEmailError(recieverEmail, e as Error);
    }
  }
}
