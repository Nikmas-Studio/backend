import { Email } from '../../types/global-types.ts';
import { Book } from '../../models/book/types.ts';
import { OrderId } from '../../models/subscription/types.ts';
import { PaymentSuccessAuthenticatedDTO } from '../../routes-dtos/payment-success-authenticated.ts';
import { PaymentSuccessGuestDTO } from '../../routes-dtos/payment-success-guest.ts';
import { PaymentSuccessWayforpayDTO } from '../../routes-dtos/payment-success-wayforpay.ts';
import { PurchaseBookAuthenticatedDTO } from '../../routes-dtos/purchase-book-authenticated.ts';
import { PurchaseBookGuestDTO } from '../../routes-dtos/purchase-book-guest.ts';

export interface GeneratePaymentLinkDto {
  readerEmail: Email;
  orderId: OrderId;
  book: Book;
  serviceURL: URL;
  regular: boolean;
}

export enum PaymentSuccessInitiator {
  GUEST = 'GUEST',
  AUTHENTICATED = 'AUTHENTICATED',
  PAYMENT_SERVICE = 'PAYMENT_SERVICE',
}

export function isPurchaseBookGuestInitiator(
  dto: PurchaseBookGuestDTO | PurchaseBookAuthenticatedDTO,
): dto is PurchaseBookGuestDTO {
  return 'email' in dto;
}

export function isPurchaseBookAuthenticatedInitiator(
  dto: PurchaseBookGuestDTO | PurchaseBookAuthenticatedDTO,
): dto is PurchaseBookAuthenticatedDTO {
  return !('email' in dto);
}

export function isPaymentSuccessGuestInitiator(
  dto:
    | PaymentSuccessGuestDTO
    | PaymentSuccessAuthenticatedDTO
    | PaymentSuccessWayforpayDTO,
): dto is PaymentSuccessGuestDTO {
  return 'authToken' in dto;
}

export function isPaymentSuccessAuthenticatedInitiator(
  dto:
    | PaymentSuccessGuestDTO
    | PaymentSuccessAuthenticatedDTO
    | PaymentSuccessWayforpayDTO,
): dto is PaymentSuccessAuthenticatedDTO {
  return !('authToken' in dto) && !('orderReference' in dto);
}

export function isPaymentSuccessWayforpayInitiator(
  dto:
    | PaymentSuccessGuestDTO
    | PaymentSuccessAuthenticatedDTO
    | PaymentSuccessWayforpayDTO,
): dto is PaymentSuccessWayforpayDTO {
  return 'orderReference' in dto;
}
