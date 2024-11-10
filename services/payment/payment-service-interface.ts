import { GeneratePaymentLinkDto } from './types.ts';

export interface PaymentService {
  /**
   * @throws {PaymentLinkGenerationError} if the payment link could not be generated
   */
  generatePaymentLink(
    GeneratePaymentLinkDto: GeneratePaymentLinkDto,
  ): Promise<URL>;
}
