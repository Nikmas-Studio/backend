import { OrderId } from '../../models/subscription/types.ts';
import { GeneratePaymentLinkDto } from './types.ts';

export interface PaymentService {
  /**
   * @throws {PaymentLinkGenerationError} if the payment link could not be generated
   */
  generatePaymentLink(
    GeneratePaymentLinkDto: GeneratePaymentLinkDto,
  ): Promise<URL>;
  
  removeRegularPayment(orderId: OrderId): Promise<void>;
  suspendRegularPayment(orderId: OrderId): Promise<void>;
  resumeRegularPayment(orderId: OrderId): Promise<void>;
}
