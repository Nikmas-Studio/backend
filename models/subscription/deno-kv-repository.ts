import { RemoveSubscriptionError, SubscriptionExistsError } from '../../errors.ts';
import { generateUUID } from '../../utils/generate-uuid.ts';
import { ReaderId } from '../reader/types.ts';
import { SubscriptionRepository } from './repository-interface.ts';
import {
  CreateSubscriptionDTO,
  OrderId,
  Subscription,
  SubscriptionHistory,
  SubscriptionHistoryId,
  SubscriptionId,
  SubscriptionStatus,
} from './types.ts';

export class SubscriptionDenoKvRepository implements SubscriptionRepository {
  constructor(private kv: Deno.Kv) {}

  async createSubscription(
    { readerId, bookId, status, orderId, accessExpiresAt }:
      CreateSubscriptionDTO,
  ): Promise<Subscription> {
    const subscription: Subscription = {
      id: generateUUID() as SubscriptionId,
      readerId,
      bookId,
      status,
      orderId,
      createdAt: new Date(),
      accessExpiresAt,
    };

    const primaryKey = ['subscriptions', subscription.id];
    const byOrderIdKey = ['subscriptions_by_order_id', subscription.orderId];
    const byReaderKey = [
      'subscriptions_by_reader',
      subscription.readerId,
      subscription.id,
    ];

    const res = await this.kv.atomic()
      .check({ key: byOrderIdKey, versionstamp: null })
      .set(primaryKey, subscription)
      .set(byOrderIdKey, subscription.id)
      .set(byReaderKey, null)
      .commit();

    if (!res.ok) {
      throw new SubscriptionExistsError(subscription.orderId);
    }

    return subscription;
  }

  async getSubscriptionById(
    subscriptionId: SubscriptionId,
  ): Promise<Subscription | null> {
    const subscription = await this.kv.get<Subscription>([
      'subscriptions',
      subscriptionId,
    ]);
    return subscription.value;
  }

  async getSubscriptionByOrderId(
    orderId: OrderId,
  ): Promise<Subscription | null> {
    const subscriptionId = await this.kv.get<SubscriptionId>([
      'subscriptions_by_order_id',
      orderId,
    ]);

    if (subscriptionId.value === null) {
      return null;
    }

    return this.getSubscriptionById(subscriptionId.value);
  }

  async getSubscriptionsByReaderId(
    readerId: ReaderId,
  ): Promise<Subscription[]> {
    const subscriptions: Subscription[] = [];

    for await (
      const { key, value: _ } of this.kv.list<SubscriptionId>({
        prefix: ['subscriptions_by_reader', readerId],
      })
    ) {
      const subscriptionId = key[2] as SubscriptionId;
      const subscription = await this.getSubscriptionById(subscriptionId);
      subscriptions.push(subscription!);
    }

    return subscriptions;
  }

  async createSubscriptionHistory(
    subscriptionId: SubscriptionId,
  ): Promise<SubscriptionHistory> {
    const subscriptionHistory: SubscriptionHistory = {
      id: generateUUID() as SubscriptionHistoryId,
      subscriptionId,
      activatedAt: new Date(),
    };

    const primaryKey = ['subscription_histories', subscriptionHistory.id];
    const bySubscriptionKey = [
      'subscription_histories_by_subscription',
      subscriptionId,
      subscriptionHistory.id,
    ];

    await this.kv.atomic()
      .set(primaryKey, subscriptionHistory)
      .set(bySubscriptionKey, null)
      .commit();

    return subscriptionHistory;
  }

  async getSubscriptionHistoryById(
    subscriptionHistoryId: SubscriptionHistoryId,
  ): Promise<SubscriptionHistory | null> {
    const subscriptionHistory = await this.kv.get<SubscriptionHistory>([
      'subscription_histories',
      subscriptionHistoryId,
    ]);

    return subscriptionHistory.value;
  }

  async getSubscriptionHistoriesBySubscriptionId(
    subscriptionId: SubscriptionId,
  ): Promise<SubscriptionHistory[]> {
    const subscriptionHistories: SubscriptionHistory[] = [];

    for await (
      const { key, value: _ } of this.kv.list<SubscriptionHistoryId>({
        prefix: ['subscription_histories_by_subscription', subscriptionId],
      })
    ) {
      const subscriptionHistoryId = key[2] as SubscriptionHistoryId;
      const subscriptionHistory = await this.getSubscriptionHistoryById(
        subscriptionHistoryId,
      );
      subscriptionHistories.push(subscriptionHistory!);
    }

    return subscriptionHistories;
  }

  async activateSubscription(subscription: Subscription): Promise<void> {
    await this.kv.set(['subscriptions', subscription.id], {
      ...subscription,
      status: SubscriptionStatus.ACTIVE,
    });
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    const iter = await this.kv.list<Subscription>({ prefix: ['subscriptions'] });

    const subscriptions: Subscription[] = [];
    for await (const { value } of iter) {
      subscriptions.push(value);
    }
    
    return subscriptions;
  }

  async removeSubscription(subscription: Subscription): Promise<void> {
    const primaryKey = ['subscriptions', subscription.id];
    const byOrderIdKey = ['subscriptions_by_order_id', subscription.orderId];
    const byReaderKey = [
      'subscriptions_by_reader',
      subscription.readerId,
      subscription.id,
    ];
    
    const res = await this.kv.atomic()
      .delete(primaryKey)
      .delete(byOrderIdKey)
      .delete(byReaderKey)
      .commit();
      
    if (!res.ok) {
      throw new RemoveSubscriptionError(subscription.id);
    }
  }
}
