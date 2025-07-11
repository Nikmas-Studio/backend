import { SendTemplatedEmailCommand, SESClient } from '@aws-sdk/client-ses';
import {
  LOGIN_LINK_TEMPLATE_NAME,
  ORDER_SUCCESS_TEMPLATE_NAME,
  PAYMENT_LINK_TEMPLATE_NAME,
  SENDPULSE_AUTH_URL,
  STUDIO_EMAIL,
} from '../../constants.ts';
import { SendLinkEmailError } from '../../errors.ts';
import { getAWSSESClientConfig } from '../../utils/get-aws-ses-client-config.ts';
import { logError } from '../../utils/logger.ts';
import { EmailService } from './email-service-interface.ts';
import {
  AddReaderToListDTO,
  LinkType,
  SendLinkDTO,
  SendOrderSuccessLetterDTO,
} from './types.ts';

export class AWSSESSendPulseEmailService implements EmailService {
  private awsClient: SESClient;

  constructor() {
    this.awsClient = new SESClient(getAWSSESClientConfig());
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
      const res = await this.awsClient.send(sendEmailCommand);
      console.log('send email response:', res);
    } catch (e) {
      logError(`Failed to send ${linkType} link email to ${readerEmail}: ${e}`);
      throw new SendLinkEmailError(readerEmail, e as Error);
    }
  }

  async sendOrderSuccessLetter(
    { readerEmail }: SendOrderSuccessLetterDTO,
  ): Promise<void> {
    const sendEmailCommand = new SendTemplatedEmailCommand({
      Source: STUDIO_EMAIL,
      Destination: {
        ToAddresses: [readerEmail],
      },
      Template: ORDER_SUCCESS_TEMPLATE_NAME,
      TemplateData: JSON.stringify({
        readerEmail,
        year: new Date().getFullYear(),
      }),
    });

    try {
      const res = await this.awsClient.send(sendEmailCommand);
      console.log('send email response:', res);
    } catch (e) {
      logError(`Failed to send order success email to ${readerEmail}: ${e}`);
      throw new SendLinkEmailError(readerEmail, e as Error);
    }
  }

  async addReaderToList(
    { readerEmail, listId, tagId }: AddReaderToListDTO,
  ): Promise<void> {
    const authResp = await fetch(SENDPULSE_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: Deno.env.get('SENDPULSE_CLIENT_ID'),
        client_secret: Deno.env.get('SENDPULSE_CLIENT_SECRET'),
      }),
    });
    const authRespJson = await authResp.json();
    const accessToken = authRespJson.access_token;

    await fetch(`https://api.sendpulse.com/addressbooks/${listId}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        emails: [readerEmail],
        tags: [tagId],
      }),
    });
  }
}
