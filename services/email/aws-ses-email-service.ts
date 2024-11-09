import { SendTemplatedEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { LOGIN_LINK_TEMPLATE_NAME, STUDIO_EMAIL } from '../../constants.ts';
import { SendLoginLinkEmailError } from '../../errors.ts';
import { getAWSSESClientConfig } from '../../utils/get-aws-ses-client-config.ts';
import { EmailService } from './email-service-interface.ts';
import { SendLoginLinkDTO } from './types.ts';
import { logError } from '../../utils/logger.ts';

export class AWSSESEmailService implements EmailService {
  private client: SESClient;

  constructor() {
    this.client = new SESClient(getAWSSESClientConfig());
  }

  async sendLoginLink(
    { readerEmail, link }: SendLoginLinkDTO,
  ): Promise<void> {
    const sendEmailCommand = new SendTemplatedEmailCommand({
      Source: STUDIO_EMAIL,
      Destination: {
        ToAddresses: [readerEmail],
      },
      Template: LOGIN_LINK_TEMPLATE_NAME,
      TemplateData: JSON.stringify({ link }),
    });

    try {
      await this.client.send(sendEmailCommand);
    } catch (e) {
      logError(`Failed to send login link email to ${readerEmail}: ${e}`);
      throw new SendLoginLinkEmailError(readerEmail, e as Error);
    }
  }
}
