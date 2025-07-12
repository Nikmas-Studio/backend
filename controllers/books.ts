import { STATUS_CODE } from '@std/http';
import { Context, TypedResponse } from 'hono';
import { HTTPException } from 'hono/http-exception';
import {
  BOOK_MASTER_ENGLISH_WITH_SHERLOCK_HOLMES_URI,
  BOOK_MASTER_GIT_AND_GITHUB_URI,
  BOOKS_WITHOUT_REGULAR_PAYMENT,
  TRANSLATION_CREDITS_TO_GRANT_ON_UPDATE_MASTER_ENGLISH_WITH_SHERLOCK_HOLMES,
} from '../constants.ts';
import { AuthRepository } from '../models/auth/repository-interface.ts';
import { BookRepository } from '../models/book/repository-interface.ts';
import { ReaderRepository } from '../models/reader/repository-interface.ts';
import { SubscriptionRepository } from '../models/subscription/repository-interface.ts';
import { OrderId, SubscriptionStatus } from '../models/subscription/types.ts';
import { GetDemoLinkDTO } from '../routes-dtos/get-demo-link.ts';
import { PurchaseBookGuestDTO } from '../routes-dtos/purchase-book-guest.ts';
import { EmailService } from '../services/email/email-service-interface.ts';
import { PaymentService } from '../services/payment/payment-service-interface.ts';
import { ActionSource, EventName } from '../types/fb-conversions-api.ts';
import { Env } from '../types/global-types.ts';
import { buildPromoPageUrl } from '../utils/build-promo-page-url.ts';
import { formatDate } from '../utils/format-date.ts';
import { generateHMACMD5 } from '../utils/generate-hmac-md5.ts';
import { generateUUID } from '../utils/generate-uuid.ts';
import { generateWfpServiceUrl } from '../utils/generate-wfp-service-url.ts';
import { getAndValidateSession } from '../utils/get-and-validate-session.ts';
import { getDemoLinkByBookURI } from '../utils/get-demo-link-by-book-uri.ts';
import { getPromoLinkByBookURI } from '../utils/get-promo-link-by-book-uri.ts';
import { hasAccessToBook } from '../utils/has-access-to-book.ts';
import { logError, logInfo } from '../utils/logger.ts';
import { notifyFbConversionsApi } from '../utils/notify-fb-conversions-api.ts';
import { verifyCaptcha } from '../utils/verify-captcha.ts';
import { verifyHoneypot } from '../utils/verify-honeypot.ts';

export class BooksController {
  constructor(
    private readerRepository: ReaderRepository,
    private authRepository: AuthRepository,
    private paymentService: PaymentService,
    private bookRepository: BookRepository,
    private subscriptionRepository: SubscriptionRepository,
    private emailService: EmailService,
  ) {}

  async purchaseBook(
    c: Context,
    purchaseBookDTO?: PurchaseBookGuestDTO,
  ): Promise<TypedResponse> {
    let reader;
    let session;

    const bookURI = c.req.param('uri');

    if (purchaseBookDTO !== undefined) {
      const { valid: honeypotIsValid } = verifyHoneypot(
        purchaseBookDTO.readerName,
      );
      if (!honeypotIsValid) {
        return c.json({
          message: 'Login link sent successfully!',
        }, STATUS_CODE.OK);
      }
      verifyCaptcha(purchaseBookDTO.captchaToken);

      const readerEmail = purchaseBookDTO.email;
      logInfo(`purchase book request for ${bookURI} for ${readerEmail}`);

      reader = await this.readerRepository.getOrCreateReader({
        email: readerEmail,
        isInvestor: false,
        hasFullAccess: false,
      });
    } else {
      session = await getAndValidateSession(c, this.authRepository);

      const foundReader = await this.readerRepository.getReaderById(
        session.readerId,
      );

      if (foundReader === null) {
        throw new HTTPException(STATUS_CODE.Unauthorized);
      }

      logInfo(`purchase book request for ${bookURI} for ${foundReader.email}`);

      reader = foundReader;
    }

    const readerSubscriptions = await this.subscriptionRepository
      .getSubscriptionsByReaderId(reader.id);

    logInfo(
      `reader ${reader.email} subscriptions: ${
        JSON.stringify(readerSubscriptions)
      }`,
    );

    const orderId = generateUUID() as OrderId;

    let existingNonActiveSubscription = null;
    for (const subscription of readerSubscriptions) {
      const book = await this.bookRepository.getBookById(subscription.bookId);
      logInfo(`subscription book: ${JSON.stringify(book)}`);
      if (
        book!.uri === bookURI
      ) {
        if (subscription.status === SubscriptionStatus.ACTIVE) {
          logError(
            `reader ${reader.id} already has access to the book: ${bookURI}`,
          );
          throw new HTTPException(STATUS_CODE.BadRequest, {
            message: `reader already has access to the book: ${bookURI}`,
          });
        } else {
          existingNonActiveSubscription = subscription;
          await this.subscriptionRepository.makeSubscriptionPending(
            subscription,
          );
          existingNonActiveSubscription.status = SubscriptionStatus.PENDING;
          await this.subscriptionRepository.updateSubscriptionOrderId(
            existingNonActiveSubscription,
            orderId,
          );
          existingNonActiveSubscription.orderId = orderId;
        }
      }
    }

    const book = await this.bookRepository.getBookByURI(bookURI);

    if (book === null) {
      logError(`book not found: ${bookURI}`);
      throw new HTTPException(STATUS_CODE.BadRequest, {
        message: `book not found: ${bookURI}`,
      });
    }

    const serviceURL = new URL(generateWfpServiceUrl());
    logInfo(
      `service URL for Wayforpay: ${serviceURL.toString()}`,
    );

    let paymentLink: URL;
    try {
      paymentLink = await this.paymentService.generatePaymentLink({
        readerEmail: reader.email,
        orderId,
        book,
        serviceURL,
        regular: !BOOKS_WITHOUT_REGULAR_PAYMENT.includes(book.uri),
      });
    } catch (_) {
      throw new HTTPException(STATUS_CODE.InternalServerError);
    }

    const subscription = existingNonActiveSubscription !== null
      ? existingNonActiveSubscription
      : await this.subscriptionRepository
        .createSubscription({
          readerId: reader.id,
          bookId: book.id,
          status: SubscriptionStatus.PENDING,
          orderId,
        });

    if (existingNonActiveSubscription === null) {
      logInfo(
        `pending subscription for reader ${reader.email} created: ${
          JSON.stringify(subscription)
        }`,
      );
    } else {
      logInfo(
        `pending subscription for reader ${reader.email} updated: ${
          JSON.stringify(subscription)
        }`,
      );
    }

    if (purchaseBookDTO !== undefined) {
      logInfo(`sending payment link to ${reader.email}`);
      try {
        await this.emailService.sendPaymentLink({
          readerEmail: reader.email,
          link: paymentLink,
          bookTitle: book.title,
        });

        return c.json({
          message: 'payment link sent successfully',
        }, STATUS_CODE.OK);
      } catch (_) {
        throw new HTTPException(STATUS_CODE.InternalServerError);
      }
    } else {
      return c.json({
        paymentLink: paymentLink.toString(),
      }, STATUS_CODE.OK);
    }
  }

  async paymentHappened(
    c: Context,
  ): Promise<TypedResponse> {
    let body;
    try {
      body = await c.req.json();
    } catch (_error) {
      body = null;
    }

    logInfo(`payment happened body: ${JSON.stringify(body)}`);
    let wfpOrderReference = body?.orderReference ?? null;
    const transactionStatus = body?.transactionStatus ?? null;

    if (transactionStatus === null || wfpOrderReference === null) {
      logError('transaction status or order referense is null');
      throw new HTTPException(STATUS_CODE.BadRequest);
    }

    let isRegularPayment = false;
    const parts = wfpOrderReference.split('_Regular');
    wfpOrderReference = parts[0];
    if (parts.length > 1) {
      isRegularPayment = true;
    }

    const orderId = wfpOrderReference as OrderId;

    const responseToWayforpay = {
      orderReference: orderId,
      status: 'accept',
      time: Math.floor(Date.now() / 1000),
    };

    const signature = generateHMACMD5(
      [
        responseToWayforpay.orderReference,
        responseToWayforpay.status,
        responseToWayforpay.time,
      ].join(';'),
      Deno.env.get('MERCHANT_SECRET_KEY')!,
    );

    const subscription = await this.subscriptionRepository
      .getSubscriptionByOrderId(orderId);
    logInfo(
      `subscription for orderId ${orderId}: ${JSON.stringify(subscription)}`,
    );
    if (
      subscription === null ||
      subscription.status === SubscriptionStatus.CANCELED
    ) {
      logError(`subscription with orderId ${orderId} not found or is canceled`);
      throw new HTTPException(STATUS_CODE.BadRequest, {
        message:
          `subscription with orderId ${orderId} not found or is canceled`,
      });
    }

    if (transactionStatus !== 'Approved') {
      if (isRegularPayment) {
        await this.paymentService.removeRegularPayment(orderId);
        await this.subscriptionRepository.cancelSubscription(subscription);
      }

      logInfo(`payment status: ${transactionStatus}`);

      logInfo(
        `payment isn't completed (${transactionStatus}) response for Wayforpay: ${
          JSON.stringify(responseToWayforpay)
        }`,
      );

      return c.json({
        ...responseToWayforpay,
        signature,
      }, STATUS_CODE.OK);
    }

    await this.readerRepository.confirmReaderEmail(subscription.readerId);

    const book = await this.bookRepository.getBookById(subscription.bookId);

    const reader = await this.readerRepository.getReaderById(
      subscription.readerId,
    );

    if (subscription.status === SubscriptionStatus.PENDING) {
      let accessExpiresAt: Date | undefined;

      if (book!.uri !== BOOK_MASTER_GIT_AND_GITHUB_URI) {
        accessExpiresAt = new Date();
        accessExpiresAt.setFullYear(accessExpiresAt.getFullYear() + 1);
      }

      await this.subscriptionRepository.activateSubscription(
        subscription,
        accessExpiresAt,
      );

      if (book!.uri === BOOK_MASTER_GIT_AND_GITHUB_URI) {
        await this.readerRepository.setInvestorStatus(
          subscription.readerId,
          true,
        );
      }

      logInfo(
        `subscription ${subscription.id} to book ${
          book!.uri
        } for reader ${subscription.readerId} is activated`,
      );

      logInfo(`sending order success letter to ${reader!.email}`);
      if (book!.uri === BOOK_MASTER_GIT_AND_GITHUB_URI) {
        this.emailService.sendOneTimePurchaseSuccessLetter({
          readerEmail: reader!.email,
        }).catch(() => {});
      } else {
        this.emailService.sendSubscriptionSuccessLetter({
          readerEmail: reader!.email,
          bookTitle: book!.title,
          promoLink: buildPromoPageUrl(book!.uri),
          paidUntil: formatDate(accessExpiresAt as Date),
        });
      }

      if (Deno.env.get('ENV') === Env.PRODUCTION) {
        const payload = {
          eventName: EventName.PURCHASE,
          actionSource: ActionSource.WEBSITE,
          eventId: orderId,
          eventSourceUrl: buildPromoPageUrl(book!.uri),
          readerEmail: reader!.email,
          readerPhone: body.phone,
          readerIpAddress: c.req.header('cf-connecting-ip')!,
          readerUserAgent: c.req.header('user-agent')!,
          bookPrice: book!.price,
        };

        notifyFbConversionsApi(payload).then(() => {
          logInfo(
            `successfully notified fb conversions api: ${
              JSON.stringify(payload)
            }`,
          );
        }).catch((error) => {
          logError(
            `error occured on fb conversions api notification: ${error}; payload: ${payload}`,
          );
        });
      }
    }

    if (book!.uri === BOOK_MASTER_ENGLISH_WITH_SHERLOCK_HOLMES_URI) {
      await this.subscriptionRepository.setTranslationCredits(
        subscription.id,
        TRANSLATION_CREDITS_TO_GRANT_ON_UPDATE_MASTER_ENGLISH_WITH_SHERLOCK_HOLMES,
      );
    }

    logInfo(
      `payment success response for Wayforpay: ${
        JSON.stringify(responseToWayforpay)
      }`,
    );

    return c.json({
      ...responseToWayforpay,
      signature,
    }, STATUS_CODE.OK);
  }

  async notifyMetaPixelOfPurchase(c: Context): Promise<TypedResponse> {
    const bookURI = c.req.param('bookUri');
    const session = await getAndValidateSession(c, this.authRepository);

    const readerSubscriptions = await this.subscriptionRepository
      .getSubscriptionsByReaderId(session.readerId);

    let subscriptionDetails = null;
    for (const subscription of readerSubscriptions) {
      const book = await this.bookRepository.getBookById(subscription.bookId);
      if (book !== null) {
        if (
          book.uri === bookURI
        ) {
          subscriptionDetails = subscription;
        }
      }
    }

    if (subscriptionDetails === null) {
      logError(`subscription not found for book: ${bookURI}`);
      throw new HTTPException(STATUS_CODE.BadRequest, {
        message: `subscription not found for book: ${bookURI}`,
      });
    }

    const { wasAlreadyNotified } = await this.subscriptionRepository
      .markSubscriptionOrderAsMetaPixelNotified(subscriptionDetails.orderId);

    return c.json({
      orderId: subscriptionDetails.orderId,
      wasAlreadyNotified,
    }, STATUS_CODE.OK);
  }

  async checkAccessToBookAndHandleRegularPayment(
    c: Context,
  ): Promise<TypedResponse> {
    const bookURI = c.req.param('uri');
    const { accessGranted, subscription, orderIdToRemoveRegularPayment } =
      await hasAccessToBook(
        c,
        bookURI,
        this.authRepository,
        this.readerRepository,
        this.subscriptionRepository,
        this.bookRepository,
      );

    if (orderIdToRemoveRegularPayment !== undefined) {
      await this.paymentService.removeRegularPayment(
        orderIdToRemoveRegularPayment,
      );
    }

    const response = {
      accessGranted,
      paidUntil: subscription?.accessExpiresAt,
      subscriptionIsActive: subscription?.status === SubscriptionStatus.ACTIVE,
    };

    return c.json(response, STATUS_CODE.OK);
  }

  async cancelSubscription(c: Context): Promise<TypedResponse> {
    const bookURI = c.req.param('uri');

    const { subscription } = await hasAccessToBook(
      c,
      bookURI,
      this.authRepository,
      this.readerRepository,
      this.subscriptionRepository,
      this.bookRepository,
    );

    if (
      subscription !== undefined &&
      subscription.status !== SubscriptionStatus.CANCELED
    ) {
      await this.subscriptionRepository.cancelSubscription(subscription);
      await this.paymentService.suspendRegularPayment(subscription.orderId);

      logInfo(
        `subscription ${subscription} is cancelled`,
      );

      return c.json({
        message: 'Subscription is cancelled',
      }, STATUS_CODE.OK);
    }

    logError(
      `subscription not found for book: ${bookURI} — or already cancelled`,
    );

    throw new HTTPException(STATUS_CODE.BadRequest, {
      message:
        `subscription not found for book: ${bookURI} — or already cancelled`,
    });
  }

  async resumeSubscription(c: Context): Promise<TypedResponse> {
    const bookURI = c.req.param('uri');

    const { accessGranted, subscription } = await hasAccessToBook(
      c,
      bookURI,
      this.authRepository,
      this.readerRepository,
      this.subscriptionRepository,
      this.bookRepository,
    );

    if (
      accessGranted && subscription !== undefined &&
      subscription.status === SubscriptionStatus.CANCELED
    ) {
      await this.subscriptionRepository.activateSubscription(
        subscription,
        subscription.accessExpiresAt,
      );
      await this.paymentService.resumeRegularPayment(subscription.orderId);

      logInfo(
        `subscription ${subscription} is resumed`,
      );

      return c.json({
        message: 'Subscription is resumed',
      }, STATUS_CODE.OK);
    }

    logError(
      `subscription not found for book: ${bookURI} — or already active`,
    );

    throw new HTTPException(STATUS_CODE.BadRequest, {
      message:
        `subscription not found for book: ${bookURI} — or already active`,
    });
  }

  async getDemoLink(
    c: Context,
    { email, captchaToken, readerName }: GetDemoLinkDTO,
    listId: number,
  ): Promise<TypedResponse> {
    const { valid: honeypotIsValid } = verifyHoneypot(
      readerName,
    );

    if (!honeypotIsValid) {
      return c.json({
        message: 'Demo link sent successfully!',
      }, STATUS_CODE.OK);
    }

    verifyCaptcha(captchaToken);

    const readerEmail = email;
    const bookURI = c.req.param('uri');

    logInfo(`get demo link request for ${bookURI} for ${readerEmail}`);

    const reader = await this.readerRepository.getOrCreateReader({
      email: readerEmail,
      isInvestor: false,
      hasFullAccess: false,
    });

    const demoFlowStarted = await this.bookRepository.demoFlowStarted(
      bookURI,
      reader.id,
    );

    if (!demoFlowStarted) {
      await this.emailService.addReaderToList({
        readerEmail,
        listId,
      });

      await this.bookRepository.startDemoFlow(bookURI, reader.id);
      logInfo(
        `demo flow is successfully started for book: ${bookURI} and reader: ${readerEmail}`,
      );
    }

    logInfo(
      `demo flow already started for book: ${bookURI} and reader: ${readerEmail}`,
    );

    const book = await this.bookRepository.getBookByURI(bookURI);

    if (book === null) {
      logError(`book not found: ${bookURI}`);
      throw new HTTPException(STATUS_CODE.NotFound, {
        message: `book not found: ${bookURI}`,
      });
    }

    await this.emailService.sendDemoLink({
      readerEmail,
      demoLink: new URL(getDemoLinkByBookURI(bookURI)),
      promoLink: new URL(getPromoLinkByBookURI(bookURI)),
      bookTitle: book.title,
    });

    return c.json({
      message: 'demo link sent successfully',
    }, STATUS_CODE.OK);
  }
}
