import { SendTemplatedEmailCommand, SESClient } from '@aws-sdk/client-ses';
import {
  LOGIN_LINK_TEMPLATE_NAME,
  PAYMENT_LINK_TEMPLATE_NAME,
  STUDIO_EMAIL,
} from '../../constants.ts';
import { SendLinkEmailError } from '../../errors.ts';
import { getAWSSESClientConfig } from '../../utils/get-aws-ses-client-config.ts';
import { EmailService } from './email-service-interface.ts';
import { LinkType, SendLinkDTO } from './types.ts';
import { logError } from '../../utils/logger.ts';

export class AWSSESEmailService implements EmailService {
  private client: SESClient;

  constructor() {
    this.client = new SESClient(getAWSSESClientConfig());
  }

  async sendLink(
    { readerEmail, link, linkType }: SendLinkDTO,
  ): Promise<void> {
    let template;

    switch (linkType) {
      case LinkType.LOGIN: {
        template = LOGIN_LINK_TEMPLATE_NAME;
        break;
      }
      case LinkType.PAYMENT: {
        template = PAYMENT_LINK_TEMPLATE_NAME;
        break;
      }
      default: {
        const _exhaustiveCheck: never = linkType;
      }
    }

    const sendEmailCommand = new SendTemplatedEmailCommand({
      Source: STUDIO_EMAIL,
      Destination: {
        ToAddresses: [readerEmail],
      },
      Template: template,
      TemplateData: JSON.stringify({
        link,
        year: new Date().getFullYear(),
      }),
    });

    try {
      const res = await this.client.send(sendEmailCommand);
      console.log('send email response:', res);
    } catch (e) {
      logError(`Failed to send ${linkType} link email to ${readerEmail}: ${e}`);
      throw new SendLinkEmailError(readerEmail, e as Error);
    }
  }
}
