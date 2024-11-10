import { SubscriptionExistsError } from '../../errors.ts';
import { generateUUID } from '../../utils/generate-uuid.ts';
import { SubscriptionRepository } from './repository-interface.ts';
import {
  CreateSubscriptionDTO,
  Subscription,
  SubscriptionHistory,
  SubscriptionHistoryId,
  SubscriptionId,
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

    const res = await this.kv.atomic()
      .check({ key: byOrderIdKey, versionstamp: null })
      .set(primaryKey, subscription)
      .set(byOrderIdKey, subscription.id)
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
    orderId: string,
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
}
