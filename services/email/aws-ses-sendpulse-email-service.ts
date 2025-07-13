import { SendTemplatedEmailCommand, SESClient } from '@aws-sdk/client-ses';
import {
  DEMO_LINK_TEMPLATE_NAME,
  LOGIN_LINK_TEMPLATE_NAME,
  ONE_TIME_PURCHASE_SUCCESS_TEMPLATE_NAME,
  PAYMENT_LINK_TEMPLATE_NAME,
  SENDPULSE_AUTH_URL,
  SENDPULSE_DEMO_MASTER_ENGLISH_WITH_SHERLOCK_HOLMES_TAG_ID,
  STUDIO_EMAIL,
  SUBSCRIPTION_SUCCESS_TEMPLATE_NAME,
} from '../../constants.ts';
import { SendEmailError } from '../../errors.ts';
import { getAWSSESClientConfig } from '../../utils/get-aws-ses-client-config.ts';
import { logError } from '../../utils/logger.ts';
import { EmailService } from './email-service-interface.ts';
import {
  AddReaderToListDTO,
  SendDemoLinkDTO,
  SendLoginLinkDTO,
  SendOneTimePurchaseSuccessLetterDTO,
  SendPaymentLinkDTO,
  SendSubscriptionSuccessLetterDTO,
} from './types.ts';

export class AWSSESSendPulseEmailService implements EmailService {
  private awsClient: SESClient;

  constructor() {
    this.awsClient = new SESClient(getAWSSESClientConfig());
  }

  async sendPaymentLink(
    { readerEmail, link, bookTitle }: SendPaymentLinkDTO,
  ): Promise<void> {
    const template = PAYMENT_LINK_TEMPLATE_NAME;

    const sendEmailCommand = new SendTemplatedEmailCommand({
      Source: STUDIO_EMAIL,
      Destination: {
        ToAddresses: [readerEmail],
      },
      Template: template,
      TemplateData: JSON.stringify({
        link,
        bookTitle,
        year: new Date().getFullYear(),
      }),
    });

    try {
      const res = await this.awsClient.send(sendEmailCommand);
      console.log('send email response:', res);
    } catch (e) {
      logError(`failed to send payment link email to ${readerEmail}: ${e}`);
      throw new SendEmailError(readerEmail, e as Error);
    }
  }

  async sendLoginLink(
    { readerEmail, link }: SendLoginLinkDTO,
  ): Promise<void> {
    const template = LOGIN_LINK_TEMPLATE_NAME;

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
      logError(`failed to send login link email to ${readerEmail}: ${e}`);
      throw new SendEmailError(readerEmail, e as Error);
    }
  }

  async sendDemoLink(
    { readerEmail, bookTitle, demoLink, promoLink }: SendDemoLinkDTO,
  ): Promise<void> {
    const template = DEMO_LINK_TEMPLATE_NAME;

    const sendEmailCommand = new SendTemplatedEmailCommand({
      Source: STUDIO_EMAIL,
      Destination: {
        ToAddresses: [readerEmail],
      },
      Template: template,
      TemplateData: JSON.stringify({
        bookTitle,
        demoLink,
        promoLink,
        year: new Date().getFullYear(),
      }),
    });

    try {
      const res = await this.awsClient.send(sendEmailCommand);
      console.log('send email response:', res);
    } catch (e) {
      logError(
        `failed to send demo link to ${bookTitle} to ${readerEmail}: ${e}`,
      );
      throw new SendEmailError(readerEmail, e as Error);
    }
  }

  async sendOneTimePurchaseSuccessLetter(
    { readerEmail }: SendOneTimePurchaseSuccessLetterDTO,
  ): Promise<void> {
    const sendEmailCommand = new SendTemplatedEmailCommand({
      Source: STUDIO_EMAIL,
      Destination: {
        ToAddresses: [readerEmail],
      },
      Template: ONE_TIME_PURCHASE_SUCCESS_TEMPLATE_NAME,
      TemplateData: JSON.stringify({
        readerEmail,
        year: new Date().getFullYear(),
      }),
    });

    try {
      await this.awsClient.send(sendEmailCommand);
    } catch (e) {
      logError(`failed to send order success email to ${readerEmail}: ${e}`);
      throw new SendEmailError(readerEmail, e as Error);
    }
  }

  async sendSubscriptionSuccessLetter(
    { readerEmail, bookTitle, promoLink, paidUntil }:
      SendSubscriptionSuccessLetterDTO,
  ): Promise<void> {
    const sendEmailCommand = new SendTemplatedEmailCommand({
      Source: STUDIO_EMAIL,
      Destination: {
        ToAddresses: [readerEmail],
      },
      Template: SUBSCRIPTION_SUCCESS_TEMPLATE_NAME,
      TemplateData: JSON.stringify({
        readerEmail,
        bookTitle,
        promoLink,
        paidUntil,
        year: new Date().getFullYear(),
      }),
    });

    try {
      await this.awsClient.send(sendEmailCommand);
    } catch (e) {
      logError(
        `failed to send subscription success email to ${readerEmail}: ${e}`,
      );
      throw new SendEmailError(readerEmail, e as Error);
    }
  }

  async addReaderToList(
    { readerEmail, listId }: AddReaderToListDTO,
  ): Promise<void> {
    let authResp;
    try {
      authResp = await fetch(SENDPULSE_AUTH_URL, {
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
    } catch (e) {
      logError(`failed to authenticate with SendPulse: ${e}`);
      throw new SendEmailError(readerEmail, e as Error);
    }

    const authRespJson = await authResp.json();
    const accessToken = authRespJson.access_token;

    try {
      await fetch(`https://api.sendpulse.com/addressbooks/${listId}/emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          emails: [readerEmail],
        }),
      });

      await fetch(`https://api.sendpulse.com/tags/pin/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          email: readerEmail,
          tags: [SENDPULSE_DEMO_MASTER_ENGLISH_WITH_SHERLOCK_HOLMES_TAG_ID],
        }),
      });
    } catch (e) {
      logError(`failed to add reader ${readerEmail} to list ${listId}: ${e}`);
      throw new SendEmailError(readerEmail, e as Error);
    }
  }
}
