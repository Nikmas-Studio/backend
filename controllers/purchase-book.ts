import { STATUS_CODE } from '@std/http/status';
import { Context, TypedResponse } from 'hono';
import { HTTPException } from 'hono/http-exception';
import {
  IS_INVESTOR_AFTER_PURCHASE,
  MASTER_GIT_AND_GITHUB_BOOK_PROMO_PAGE_URL,
} from '../constants.ts';
import { AuthRepository } from '../models/auth/repository-interface.ts';
import { AuthToken, AuthTokenId } from '../models/auth/types.ts';
import { BookRepository } from '../models/book/repository-interface.ts';
import { ReaderRepository } from '../models/reader/repository-interface.ts';
import { SubscriptionRepository } from '../models/subscription/repository-interface.ts';
import {
  OrderId,
  Subscription,
  SubscriptionStatus,
} from '../models/subscription/types.ts';
import { PurchaseBookAuthenticatedDTO } from '../routes-dtos/purchase-book-authenticated.ts';
import { PurchaseBookGuestDTO } from '../routes-dtos/purchase-book-guest.ts';
import { EmailService } from '../services/email/email-service-interface.ts';
import { LinkType } from '../services/email/types.ts';
import { PaymentService } from '../services/payment/payment-service-interface.ts';
import { isPurchaseBookGuestInitiator } from '../services/payment/types.ts';
import { generateBookReadUrl } from '../utils/generate-book-read-url.ts';
import { generateHMACMD5 } from '../utils/generate-hmac-md5.ts';
import { generatePaymentAuthenticatedReturnURL } from '../utils/generate-payment-authenticated-return-url.ts';
import { generatePaymentGuestReturnURL } from '../utils/generate-payment-guest-return-url.ts';
import { generateUUID } from '../utils/generate-uuid.ts';
import { generateWfpServiceUrl } from '../utils/generate-wfp-service-url.ts';
import { getAndValidateSession } from '../utils/get-and-validate-session.ts';
import { logError, logInfo } from '../utils/logger.ts';
import { validateAuthTokenAndCreateSession } from '../utils/validate-auth-token-and-create-session.ts';
import { verifyCaptcha } from '../utils/verify-captcha.ts';
import { verifyHoneypot } from '../utils/verify-honeypot.ts';
import { notifyFbConversionsApi } from '../utils/notify-fb-conversions-api.ts';
import { ActionSource, EventName } from '../types/fb-conversions-api.ts';
import { Env } from '../types/global-types.ts';

export class PurchaseBookController {
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
    purchaseBookDTO: PurchaseBookGuestDTO | PurchaseBookAuthenticatedDTO,
  ): Promise<TypedResponse> {
    let reader;
    let session;
    if (isPurchaseBookGuestInitiator(purchaseBookDTO)) {
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
      logInfo(`purchase book request for ${readerEmail}`);

      reader = await this.readerRepository.getOrCreateReader({
        email: readerEmail,
        isInvestor: IS_INVESTOR_AFTER_PURCHASE,
        hasFullAccess: false,
      });
    } else {
      session = await getAndValidateSession(c, this.authRepository);
      console.log('session of initiator', session);

      const foundReader = await this.readerRepository.getReaderById(
        session.readerId,
      );
      if (foundReader === null) {
        throw new HTTPException(STATUS_CODE.Unauthorized);
      }

      reader = foundReader;
    }

    const bookURI = purchaseBookDTO.bookURI;

    const readerSubscriptions = await this.subscriptionRepository
      .getSubscriptionsByReaderId(reader.id);

    logInfo(
      `reader ${reader.email} subscriptions: ${
        JSON.stringify(readerSubscriptions)
      }`,
    );

    let existingPendingSubscription: Subscription | null = null;
    for (const subscription of readerSubscriptions) {
      const book = await this.bookRepository.getBookById(subscription.bookId);
      logInfo(`subscription book: ${JSON.stringify(book)}`);
      if (
        book!.uri === bookURI &&
        subscription.status === SubscriptionStatus.ACTIVE
      ) {
        logError(
          `reader ${reader.id} already has access to the book: ${bookURI}`,
        );
        throw new HTTPException(STATUS_CODE.BadRequest, {
          message: `reader already has access to the book: ${bookURI}`,
        });
      }

      if (
        book!.uri === bookURI &&
        subscription.status === SubscriptionStatus.PENDING
      ) {
        existingPendingSubscription = subscription;
      }
    }

    let authToken: AuthToken | null = null;
    if (isPurchaseBookGuestInitiator(purchaseBookDTO)) {
      authToken = await this.authRepository.createAuthToken(reader.id);
    }

    const orderId = generateUUID() as OrderId;

    const book = await this.bookRepository.getBookByURI(bookURI);

    if (book === null) {
      logError(`book not found: ${bookURI}`);
      throw new HTTPException(STATUS_CODE.BadRequest, {
        message: `book not found: ${bookURI}`,
      });
    }

    const returnURL = isPurchaseBookGuestInitiator(purchaseBookDTO)
      ? generatePaymentGuestReturnURL(orderId, authToken!.id)
      : generatePaymentAuthenticatedReturnURL(orderId, session!.id);

    const serviceURL = new URL(generateWfpServiceUrl());

    let paymentLink: URL;
    try {
      paymentLink = await this.paymentService.generatePaymentLink({
        readerEmail: reader.email,
        orderId,
        book,
        returnURL,
        serviceURL,
      });
    } catch (_) {
      throw new HTTPException(STATUS_CODE.InternalServerError);
    }

    const subscription = await this.subscriptionRepository
      .createSubscription({
        readerId: reader.id,
        bookId: book.id,
        status: SubscriptionStatus.PENDING,
        orderId,
      }, existingPendingSubscription ?? undefined);

    logInfo(
      `pending subscription for reader ${reader.email} created: ${
        JSON.stringify(subscription)
      }`,
    );

    if (isPurchaseBookGuestInitiator(purchaseBookDTO)) {
      logInfo(`sending payment link to ${reader.email}`);
      try {
        await this.emailService.sendLink({
          readerEmail: reader.email,
          link: paymentLink,
          linkType: LinkType.PAYMENT,
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

  async paymentSuccess(
    c: Context,
  ): Promise<TypedResponse> {
    let body;
    try {
      body = await c.req.json();
    } catch (_error) {
      body = null;
    }

    logInfo(`payment success body: ${JSON.stringify(body)}`);
    const wfpOrderReference = body?.orderReference ?? null;
    const transactionStatus = body?.transactionStatus ?? null;

    if (transactionStatus !== null) {
      if (transactionStatus !== 'Approved') {
        const responseToWayforpay = {
          orderReference: wfpOrderReference,
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
    }

    const authTokenId = c.req.query('authToken') ?? null;
    logInfo(`auth token id from query: ${authTokenId}`);

    if (authTokenId !== null) {
      await validateAuthTokenAndCreateSession(
        c,
        authTokenId as AuthTokenId,
        this.authRepository,
      );
    }

    if (authTokenId === null && wfpOrderReference === null) {
      const sessionId = c.req.query('session');
      await getAndValidateSession(c, this.authRepository, {
        sessionId,
      });
    }

    let orderId: OrderId;

    if (wfpOrderReference !== null) {
      orderId = wfpOrderReference as OrderId;
      logInfo(`wayforpay order reference: ${orderId}`);
    } else {
      orderId = c.req.query('order') as OrderId;
      logInfo(`order id from query: ${orderId}`);
    }

    const subscription = await this.subscriptionRepository
      .getSubscriptionByOrderId(orderId);
    if (subscription === null) {
      logError(`subscription not found: ${orderId}`);
      throw new HTTPException(STATUS_CODE.BadRequest);
    }

    this.readerRepository.confirmReaderEmail(subscription.readerId);

    const book = await this.bookRepository.getBookById(subscription.bookId);

    const reader = await this.readerRepository.getReaderById(
      subscription.readerId,
    );

    if (subscription.status === SubscriptionStatus.PENDING) {
      this.subscriptionRepository.activateSubscription(subscription);
      this.subscriptionRepository.createSubscriptionHistory(subscription.id);
      this.readerRepository.setInvestorStatus(
        subscription.readerId,
        IS_INVESTOR_AFTER_PURCHASE,
      );

      logInfo(
        `subscription ${subscription.id} to book ${
          book!.uri
        } for reader ${subscription.readerId} is activated`,
      );

      logInfo(`sending order success letter to ${reader!.email}`);
      this.emailService.sendOrderSuccessLetter({
        readerEmail: reader!.email,
      }).catch(() => {});
    }

    if (wfpOrderReference !== null) {
      if (Deno.env.get('ENV') === Env.PRODUCTION) {
        const payload = {
          eventName: EventName.PURCHASE,
          actionSource: ActionSource.WEBSITE,
          eventId: orderId,
          eventSourceUrl: new URL(MASTER_GIT_AND_GITHUB_BOOK_PROMO_PAGE_URL),
          readerEmail: reader!.email,
          readerPhone: body.phone,
          readerIpAddress: c.req.header('cf-connecting-ip')!,
          readerUserAgent: c.req.header('user-agent')!,
          bookPrice: book!.mainPrice,
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

      logInfo(
        `payment success response for Wayforpay: ${
          JSON.stringify(responseToWayforpay)
        }`,
      );

      return c.json({
        ...responseToWayforpay,
        signature,
      }, STATUS_CODE.OK);
    } else {
      return c.redirect(generateBookReadUrl(book!.uri));
    }
  }
}
