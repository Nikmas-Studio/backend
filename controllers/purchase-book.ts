import { STATUS_CODE } from '@std/http/status';
import { Context, TypedResponse } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { IS_INVESTOR_BY_DEFAULT, WAYFORPAY_SERVICE_URL } from '../constants.ts';
import { AuthRepository } from '../models/auth/repository-interface.ts';
import { BookRepository } from '../models/book/repository-interface.ts';
import { ReaderRepository } from '../models/reader/repository-interface.ts';
import { SubscriptionRepository } from '../models/subscription/repository-interface.ts';
import { OrderId, SubscriptionStatus } from '../models/subscription/types.ts';
import { PurchaseBookGuestDTO } from '../routes-dtos/purchase-book-guest.ts';
import { PaymentService } from '../services/payment/payment-service-interface.ts';
import { generatePaymentGuestReturnURL } from '../utils/generate-payment-guest-return-url.ts';
import { generateUUID } from '../utils/generate-uuid.ts';
import { logInfo } from '../utils/logger.ts';
import { EmailService } from '../services/email/email-service-interface.ts';
import { LinkType } from '../services/email/types.ts';

export class PurchaseBookController {
  constructor(
    private readerRepository: ReaderRepository,
    private authRepository: AuthRepository,
    private paymentService: PaymentService,
    private bookRepository: BookRepository,
    private subscriptionRepository: SubscriptionRepository,
    private emailService: EmailService,
  ) {}

  async purchaseBookGuest(
    c: Context,
    { email: readerEmail, bookURI }: PurchaseBookGuestDTO,
  ): Promise<TypedResponse> {
    logInfo(`purchase book request for ${readerEmail}`);

    const reader = await this.readerRepository.getOrCreateReader({
      email: readerEmail,
      isInvestor: IS_INVESTOR_BY_DEFAULT,
      hasFullAccess: false,
    });

    const authToken = await this.authRepository.createAuthToken(reader.id);
    const orderId = generateUUID() as OrderId;

    const book = await this.bookRepository.getBookByURI(bookURI);

    if (book === null) {
      throw new HTTPException(STATUS_CODE.BadRequest, {
        message: `book not found: ${bookURI}`,
      });
    }

    const returnURL = generatePaymentGuestReturnURL(orderId, authToken.id);
    const serviceURL = new URL(WAYFORPAY_SERVICE_URL);

    let paymentLink: URL;
    try {
      paymentLink = await this.paymentService.generatePaymentLink({
        readerEmail,
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
      `pending subscription for reader ${readerEmail} created: ${
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
}
