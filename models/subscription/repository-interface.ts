import {
  CreateSubscriptionDTO,
  Subscription,
  SubscriptionHistory,
  SubscriptionHistoryId,
  SubscriptionId,
} from './types.ts';

export interface SubscriptionRepository {
  createSubscription(
    createSubscriptionDTO: CreateSubscriptionDTO,
  ): Promise<Subscription>;
  getSubscriptionById(
    subscriptionId: SubscriptionId,
  ): Promise<Subscription | null>;
  getSubscriptionByOrderId(orderId: string): Promise<Subscription | null>;
  createSubscriptionHistory(
    subscriptionId: SubscriptionId,
  ): Promise<SubscriptionHistory>;
  getSubscriptionHistoryById(
    subscriptionHistoryId: SubscriptionHistoryId,
  ): Promise<SubscriptionHistory | null>;
  getSubscriptionHistoriesBySubscriptionId(
    subscriptionId: SubscriptionId,
  ): Promise<SubscriptionHistory[]>;
}
