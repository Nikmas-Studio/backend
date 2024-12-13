import { Context, TypedResponse } from 'hono';
import { SubscriptionRepository } from '../models/subscription/repository-interface.ts';
import { VerifyOrderIdDTO } from '../routes-dtos/verify-order-id.ts';
import { OrderId } from '../models/subscription/types.ts';
import { STATUS_CODE } from '@std/http';
import { logInfo } from '../utils/logger.ts';

export class OrdersController {
  constructor(
    private subscriptionRepository: SubscriptionRepository,
  ) {}

  async verifyOrder(
    c: Context,
    { orderId }: VerifyOrderIdDTO,
  ): Promise<TypedResponse> {
    const subscription = await this.subscriptionRepository
      .getSubscriptionByOrderId(orderId as OrderId);
      
    logInfo(`Found subscription: ${subscription}`);
      
    if (subscription === null) {
      return c.json({
        isValid: false,
      }, STATUS_CODE.OK);
    }

    return c.json({
      isValid: true,
    }, STATUS_CODE.OK);
  }
}
