import {
  CURRENCY,
  DEFAULT_PAYMENT_SYSTEM,
  MERCHANT_ACCOUNT,
  MERCHANT_DOMAIN_NAME,
  MERCHANT_PASSWORD,
  PAYMENT_SYSTEMS,
  WAYFORPAY_GENERATE_PAYMENT_LINK_URL,
  WAYFORPAY_REGULAR_API_URL,
} from '../../constants.ts';
import { PaymentLinkGenerationError } from '../../errors.ts';
import { OrderId } from '../../models/subscription/types.ts';
import { generateHMACMD5 } from '../../utils/generate-hmac-md5.ts';
import { logError, logInfo } from '../../utils/logger.ts';
import { PaymentService } from './payment-service-interface.ts';
import { GeneratePaymentLinkDto } from './types.ts';

export class WayforpayPaymentService implements PaymentService {
  async generatePaymentLink(
    { readerEmail, book, serviceURL, orderId, regular }: GeneratePaymentLinkDto,
  ): Promise<URL> {
    const orderDate = String(Math.floor(Date.now() / 1000));

    const params: Record<string, string> = {
      merchantAccount: Deno.env.get(MERCHANT_ACCOUNT)!,
      merchantDomainName: MERCHANT_DOMAIN_NAME,
      orderReference: orderId,
      orderDate,
      amount: String(book.price),
      currency: CURRENCY,
      'productName[]': `Interactive E-Book «${book.title}»`,
      'productCount[]': '1',
      'productPrice[]': String(book.price),
      clientEmail: readerEmail,
      defaultPaymentSystem: DEFAULT_PAYMENT_SYSTEM,
      paymentSystems: PAYMENT_SYSTEMS,
      serviceUrl: serviceURL.toString(),
    };

    if (regular) {
      params.regularBehavior = 'preset';
      params.regularMode = 'yearly';
      params.regularAmount = String(book.price);
      params.regularOn = '1';
    }

    logInfo(
      `generating payment link for reader: ${readerEmail}, regular: ${regular} book: ${book.title}, orderId: ${orderId}, params: ${
        JSON.stringify(params)
      }`,
    );

    const message = [
      params.merchantAccount,
      params.merchantDomainName,
      params.orderReference,
      params.orderDate,
      params.amount,
      params.currency,
      params['productName[]'],
      params['productCount[]'],
      params['productPrice[]'],
    ].join(';');

    const signature = generateHMACMD5(
      message,
      Deno.env.get('MERCHANT_SECRET_KEY')!,
    );

    const formData = new URLSearchParams({
      ...params,
      merchantSignature: signature,
    });
    
    logInfo(`formData: ${formData.toString()}`);

    let res;
    try {
      res = await fetch(WAYFORPAY_GENERATE_PAYMENT_LINK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
        body: formData.toString(),
        redirect: 'manual',
      });
    } catch (e) {
      logError(`error during payment link generation: ${e}`);
      throw new PaymentLinkGenerationError(
        'error during request to payment service',
        e as Error,
      );
    }

    const paymentLink = res.headers.get('Location');

    if (!paymentLink) {
      logError(`payment redirect link for ${readerEmail} is not generated`);
      throw new PaymentLinkGenerationError(
        'payment redirect link is not generated',
      );
    }

    logInfo(
      `payment link for ${readerEmail} is successfully generated: ${paymentLink}`,
    );

    return new URL(paymentLink);
  }

  async removeRegularPayment(orderId: OrderId): Promise<void> {
    await fetch(WAYFORPAY_REGULAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestType: 'REMOVE',
        merchantAccount: Deno.env.get(MERCHANT_ACCOUNT)!,
        merchantPassword: Deno.env.get(MERCHANT_PASSWORD)!,
        orderReference: orderId,
      }),
    });
  }

  async suspendRegularPayment(orderId: OrderId): Promise<void> {
    await fetch(WAYFORPAY_REGULAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestType: 'SUSPEND',
        merchantAccount: Deno.env.get(MERCHANT_ACCOUNT)!,
        merchantPassword: Deno.env.get(MERCHANT_PASSWORD)!,
        orderReference: orderId,
      }),
    });
  }

  async resumeRegularPayment(orderId: OrderId): Promise<void> {
    await fetch(WAYFORPAY_REGULAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestType: 'RESUME',
        merchantAccount: Deno.env.get(MERCHANT_ACCOUNT)!,
        merchantPassword: Deno.env.get(MERCHANT_PASSWORD)!,
        orderReference: orderId,
      }),
    });
  }
}
