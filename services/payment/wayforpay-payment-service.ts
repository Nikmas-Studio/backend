import {
  CURRENCY,
  DEFAULT_PAYMENT_SYSTEM,
  MERCHANT_ACCOUNT,
  MERCHANT_DOMAIN_NAME,
  PAYMENT_SYSTEMS,
  WAYFORPAY_GENERATE_PAYMENT_LINK_URL,
} from '../../constants.ts';
import { PaymentLinkGenerationError } from '../../errors.ts';
import { generateHMACMD5 } from '../../utils/generate-hmac-md5.ts';
import { logError, logInfo } from '../../utils/logger.ts';
import { PaymentService } from './payment-service-interface.ts';
import { GeneratePaymentLinkDto } from './types.ts';

export class WayforpayPaymentService implements PaymentService {
  async generatePaymentLink(
    { readerEmail, book, returnURL, serviceURL, orderId }:
      GeneratePaymentLinkDto,
  ): Promise<URL> {
    const orderDate = String(Math.floor(Date.now() / 1000));

    const params = {
      merchantAccount: Deno.env.get(MERCHANT_ACCOUNT)!,
      merchantDomainName: MERCHANT_DOMAIN_NAME,
      orderReference: orderId,
      orderDate,
      amount: String(book.mainPrice),
      currency: CURRENCY,
      'productName[]': `[Early Access] Interactive E-Book «${book.title}»`,
      'productCount[]': '1',
      'productPrice[]': String(book.mainPrice),
      clientEmail: readerEmail,
      defaultPaymentSystem: DEFAULT_PAYMENT_SYSTEM,
      paymentSystems: PAYMENT_SYSTEMS,
      returnUrl: returnURL.toString(),
      serviceUrl: serviceURL.toString(),
    };
    
    console.log(params);

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
    
    console.log(message);
    
    console.log(Deno.env.get('MERCHANT_SECRET_KEY'));

    const signature = generateHMACMD5(
      message,
      Deno.env.get('MERCHANT_SECRET_KEY')!,
    );
    
    console.log(signature);

    const formData = new URLSearchParams({
      ...params,
      merchantSignature: signature,
    });
    
    console.log(formData);

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

    console.log(res.body);
    console.log(res.status);
    console.log(res.headers);
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
}
