import { STATUS_CODE } from '@std/http/status';
import { Context, TypedResponse } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { IS_INVESTOR_BY_DEFAULT, WAYFORPAY_SERVICE_URL } from '../constants.ts';
import { AuthRepository } from '../models/auth/repository-interface.ts';
import { AuthTokenId } from '../models/auth/types.ts';
import { BookRepository } from '../models/book/repository-interface.ts';
import { ReaderRepository } from '../models/reader/repository-interface.ts';
import { SubscriptionRepository } from '../models/subscription/repository-interface.ts';
import { OrderId, SubscriptionStatus } from '../models/subscription/types.ts';
import { PaymentSuccessAuthenticatedDTO } from '../routes-dtos/payment-success-authenticated.ts';
import { PaymentSuccessGuestDTO } from '../routes-dtos/payment-success-guest.ts';
import { PaymentSuccessWayforpayDTO } from '../routes-dtos/payment-success-wayforpay.ts';
import { PurchaseBookAuthenticatedDTO } from '../routes-dtos/purchase-book-authenticated.ts';
import { PurchaseBookGuestDTO } from '../routes-dtos/purchase-book-guest.ts';
import { EmailService } from '../services/email/email-service-interface.ts';
import { LinkType } from '../services/email/types.ts';
import { PaymentService } from '../services/payment/payment-service-interface.ts';
import {
  isPaymentSuccessAuthenticatedInitiator,
  isPaymentSuccessGuestInitiator,
  isPaymentSuccessWayforpayInitiator,
  isPurchaseBookGuestInitiator,
} from '../services/payment/types.ts';
import { generatePaymentAuthenticatedReturnURL } from '../utils/generate-payment-authenticated-return-url.ts';
import { generatePaymentGuestReturnURL } from '../utils/generate-payment-guest-return-url.ts';
import { generateUUID } from '../utils/generate-uuid.ts';
import { getAndValidateSession } from '../utils/get-and-validate-session.ts';
import { logDebug, logInfo } from '../utils/logger.ts';
import { validateAuthTokenAndCreateSession } from '../utils/validate-auth-token-and-create-session.ts';
import { generateHMACMD5 } from '../utils/generate-hmac-md5.ts';
import { verifyCaptcha } from '../utils/verify-captcha.ts';
import { verifyHoneypot } from '../utils/verify-honeypot.ts';

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
    if (isPurchaseBookGuestInitiator(purchaseBookDTO)) {
      const { valid: honeypotIsValid } = verifyHoneypot(purchaseBookDTO.readerName);
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
        isInvestor: IS_INVESTOR_BY_DEFAULT,
        hasFullAccess: false,
      });
    } else {
      const session = await getAndValidateSession(c, this.authRepository);

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
    for (const subscription of readerSubscriptions) {
      const book = await this.bookRepository.getBookById(subscription.bookId);
      logInfo(`subscription book: ${JSON.stringify(book)}`);
      if (
        book!.uri === bookURI &&
        subscription.status === SubscriptionStatus.ACTIVE
      ) {
        throw new HTTPException(STATUS_CODE.BadRequest, {
          message: `reader already has access to the book: ${bookURI}`,
        });
      }
    }

    const authToken = await this.authRepository.createAuthToken(reader.id);
    const orderId = generateUUID() as OrderId;

    const book = await this.bookRepository.getBookByURI(bookURI);

    if (book === null) {
      throw new HTTPException(STATUS_CODE.BadRequest, {
        message: `book not found: ${bookURI}`,
      });
    }

    const returnURL = isPurchaseBookGuestInitiator(purchaseBookDTO)
      ? generatePaymentGuestReturnURL(orderId, authToken.id)
      : generatePaymentAuthenticatedReturnURL(orderId);

    const serviceURL = new URL(WAYFORPAY_SERVICE_URL);

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

    const subscription = await this.subscriptionRepository.createSubscription({
      readerId: reader.id,
      bookId: book.id,
      status: SubscriptionStatus.PENDING,
      orderId,
    });

    logInfo(
      `pending subscription for reader ${reader.email} created: ${
        JSON.stringify(subscription)
      }`,
    );

    try {
      await this.emailService.sendLink({
        readerEmail: reader.email,
        link: paymentLink,
        linkType: LinkType.PAYMENT,
      });
    } catch (_) {
      throw new HTTPException(STATUS_CODE.InternalServerError);
    }

    return c.json({
      message: 'payment link sent successfully',
    }, STATUS_CODE.OK);
  }

  async paymentSuccess(
    c: Context,
    paymentSuccessDTO:
      | PaymentSuccessGuestDTO
      | PaymentSuccessAuthenticatedDTO
      | PaymentSuccessWayforpayDTO,
  ): Promise<TypedResponse> {
    if (isPaymentSuccessGuestInitiator(paymentSuccessDTO)) {
      const authTokenId = paymentSuccessDTO.authToken as AuthTokenId;
      await validateAuthTokenAndCreateSession(
        c,
        authTokenId,
        this.authRepository,
      );
    }

    if (isPaymentSuccessAuthenticatedInitiator(paymentSuccessDTO)) {
      await getAndValidateSession(c, this.authRepository);
    }

    let orderId: OrderId;

    if (isPaymentSuccessWayforpayInitiator(paymentSuccessDTO)) {
      orderId = paymentSuccessDTO.orderReference as OrderId;
    } else {
      orderId = paymentSuccessDTO.orderId as OrderId;
    }

    const subscription = await this.subscriptionRepository
      .getSubscriptionByOrderId(orderId);
    if (subscription === null) {
      throw new HTTPException(STATUS_CODE.BadRequest);
    }
    
    this.readerRepository.confirmReaderEmail(subscription.readerId);

    const book = await this.bookRepository.getBookById(subscription.bookId);

    if (subscription.status === SubscriptionStatus.PENDING) {
      this.subscriptionRepository.activateSubscription(subscription);
      this.subscriptionRepository.createSubscriptionHistory(subscription.id);
    }

    if (isPaymentSuccessWayforpayInitiator(paymentSuccessDTO)) {
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

      return c.json({
        ...responseToWayforpay,
        signature,
      }, STATUS_CODE.OK);
    } else {
      return c.json({
        'bookURI': book!.uri,
      }, STATUS_CODE.OK);
    }
  }
}
