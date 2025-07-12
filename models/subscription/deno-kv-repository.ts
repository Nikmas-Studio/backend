import {
  RemoveSubscriptionError,
  RemoveSubscriptionHistoryError,
  SubscriptionExistsError,
  SubscriptionNotFoundError,
  TranslationCreditsObjectNotFoundError,
} from '../../errors.ts';
import { generateUUID } from '../../utils/generate-uuid.ts';
import { BookId } from '../book/types.ts';
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
    orderId: OrderId,
  ): Promise<SubscriptionHistory> {
    const subscriptionHistory: SubscriptionHistory = {
      id: generateUUID() as SubscriptionHistoryId,
      orderId,
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

  async makeSubscriptionPending(subscription: Subscription): Promise<void> {
    await this.kv.set(['subscriptions', subscription.id], {
      ...subscription,
      status: SubscriptionStatus.PENDING,
    });
  }

  async updateSubscriptionOrderId(
    subscription: Subscription,
    newOrderId: OrderId,
  ): Promise<void> {
    await this.kv.set(['subscriptions', subscription.id], {
      ...subscription,
      orderId: newOrderId,
    });
  }

  async activateSubscription(subscription: Subscription, accessExpiresAt?: Date): Promise<void> {
    await this.kv.set(['subscriptions', subscription.id], {
      ...subscription,
      accessExpiresAt,
      status: SubscriptionStatus.ACTIVE,
    });
    await this.createSubscriptionHistory(subscription.id, subscription.orderId);
  }

  async cancelSubscription(subscription: Subscription): Promise<void> {
    await this.kv.set(['subscriptions', subscription.id], {
      ...subscription,
      status: SubscriptionStatus.CANCELED,
    });

    const subscriptionHistories = await this
      .getSubscriptionHistoriesBySubscriptionId(
        subscription.id,
      );

    for (const history of subscriptionHistories) {
      if (history.canceledAt === undefined) {
        await this.kv.set(['subscription_histories', history.id], {
          ...history,
          canceledAt: new Date(),
        });
      }
    }
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    const iter = await this.kv.list<Subscription>({
      prefix: ['subscriptions'],
    });

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

  async removeSubscriptionHistory(
    subscriptionHistory: SubscriptionHistory,
  ): Promise<void> {
    const primaryKey = ['subscription_histories', subscriptionHistory.id];
    const bySubscriptionKey = [
      'subscription_histories_by_subscription',
      subscriptionHistory.subscriptionId,
      subscriptionHistory.id,
    ];

    const res = await this.kv.atomic()
      .delete(primaryKey)
      .delete(bySubscriptionKey)
      .commit();

    if (!res.ok) {
      throw new RemoveSubscriptionHistoryError(subscriptionHistory.id);
    }
  }

  async markSubscriptionOrderAsMetaPixelNotified(
    orderId: OrderId,
  ): Promise<{ wasAlreadyNotified: boolean }> {
    const key = ['meta_pixel_notified_orders', orderId];

    const existingNotifiedOrder = await this.kv.get(key);

    if (existingNotifiedOrder.value !== null) {
      return { wasAlreadyNotified: true };
    }

    await this.kv.set(key, true);

    return { wasAlreadyNotified: false };
  }

  async setTranslationCredits(
    connection: SubscriptionId | { readerId: ReaderId; bookId: BookId },
    creditsGranted: number,
  ): Promise<void> {
    let primaryKey;
    let updateAt;

    if ('readerId' in connection) {
      primaryKey = [
        'translation_credits',
        connection.readerId,
        connection.bookId,
      ];
      updateAt = new Date(
        new Date().setFullYear(new Date().getFullYear() + 1),
      );
    } else {
      const subscription = await this.getSubscriptionById(connection);
      if (subscription === null) {
        throw new SubscriptionNotFoundError(connection);
      }

      primaryKey = ['translation_credits', connection];
      updateAt = subscription.accessExpiresAt;
    }

    const value = {
      creditsGranted,
      updateAt,
    };

    await this.kv.set(primaryKey, value);
  }

  async checkAndUpdateTranslationCredits(
    connection: SubscriptionId | { readerId: ReaderId; bookId: BookId },
    translationPrice: number,
    creditsToGrantOnUpdate: number,
  ): Promise<{ enoughCredits: boolean }> {
    const key = 'readerId' in connection
      ? [
        'translation_credits',
        connection.readerId,
        connection.bookId,
      ]
      : ['translation_credits', connection];

    const credits = await this.kv.get<
      { creditsGranted: number; updateAt: Date }
    >(key);

    let creditsValue = credits.value;

    if (creditsValue === null) {
      if ('readerId' in connection) {
        const creditsForFullAccessReader = {
          creditsGranted: creditsToGrantOnUpdate,
          updateAt: new Date(
            new Date().setFullYear(
              new Date().getFullYear() + 1,
            ),
          ),
        };

        await this.kv.set(key, creditsForFullAccessReader);
        creditsValue = creditsForFullAccessReader;
      }
      throw new TranslationCreditsObjectNotFoundError(connection);
    }

    if (new Date() >= creditsValue.updateAt) {
      let subscription = null;
      if (!('readerId' in connection)) {
        subscription = await this.getSubscriptionById(connection);
        if (subscription === null) {
          throw new SubscriptionNotFoundError(connection);
        }
      }

      const updateAt =
        subscription !== null && subscription.accessExpiresAt !== undefined &&
          subscription.accessExpiresAt > creditsValue.updateAt
          ? subscription.accessExpiresAt
          : new Date(
            new Date(creditsValue.updateAt).setFullYear(
              new Date(creditsValue.updateAt).getFullYear() + 1,
            ),
          );

      const newCredits = {
        creditsGranted: creditsToGrantOnUpdate,
        updateAt,
      };

      creditsValue = newCredits;

      await this.kv.set(key, newCredits);
    }

    if (creditsValue.creditsGranted >= translationPrice) {
      creditsValue.creditsGranted -= translationPrice;
      await this.kv.set(key, creditsValue);
      return { enoughCredits: true };
    }

    return { enoughCredits: false };
  }
}
