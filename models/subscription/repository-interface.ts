import { ReaderId } from '../reader/types.ts';
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
  getSubscriptionsByReaderId(readerId: ReaderId): Promise<Subscription[]>;
  activateSubscription(subscription: Subscription): Promise<void>;
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
