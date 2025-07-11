import { BookId } from '../book/types.ts';
import { ReaderId } from '../reader/types.ts';
import {
  CreateSubscriptionDTO,
  OrderId,
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
  getSubscriptionByOrderId(orderId: OrderId): Promise<Subscription | null>;
  getSubscriptionsByReaderId(readerId: ReaderId): Promise<Subscription[]>;
  activateSubscription(subscription: Subscription): Promise<void>;
  cancelSubscription(subscription: Subscription): Promise<void>;
  makeSubscriptionPending(subscription: Subscription): Promise<void>;
  updateSubscriptionOrderId(subscription: Subscription, newOrderId: OrderId): Promise<void>;
  getSubscriptionHistoryById(
    subscriptionHistoryId: SubscriptionHistoryId,
  ): Promise<SubscriptionHistory | null>;
  getSubscriptionHistoriesBySubscriptionId(
    subscriptionId: SubscriptionId,
  ): Promise<SubscriptionHistory[]>;
  getAllSubscriptions(): Promise<Subscription[]>;
  removeSubscription(subscription: Subscription): Promise<void>;
  removeSubscriptionHistory(
    subscriptionHistory: SubscriptionHistory,
  ): Promise<void>;
  markSubscriptionOrderAsMetaPixelNotified(
    orderId: OrderId,
  ): Promise<{ wasAlreadyNotified: boolean }>;
  setTranslationCredits(
    connection: SubscriptionId | { readerId: ReaderId; bookId: BookId },
    creditsGranted: number,
  ): Promise<void>;
  checkAndUpdateTranslationCredits(
    connection: SubscriptionId | { readerId: ReaderId; bookId: BookId },
    translationPrice: number,
    creditsToGrantOnUpdate: number,
  ): Promise<{ enoughCredits: boolean }>;
}
