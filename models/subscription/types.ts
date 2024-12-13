import { Branded, UUID } from '../../types/global-types.ts';
import { BookId } from '../book/types.ts';
import { ReaderId } from '../reader/types.ts';

export type OrderId = Branded<UUID, 'OrderId'>;

export type SubscriptionId = Branded<UUID, 'SubscriptionId'>;

export enum SubscriptionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
}

export interface Subscription {
  id: SubscriptionId;
  readerId: ReaderId;
  bookId: BookId;
  status: SubscriptionStatus;
  orderId: OrderId;
  createdAt: Date;
  accessExpiresAt?: Date;
}

export type SubscriptionHistoryId = Branded<UUID, 'SubscriptionHistoryId'>;

export interface SubscriptionHistory {
  id: SubscriptionHistoryId;
  subscriptionId: SubscriptionId;
  activatedAt: Date;
  canceledAt?: Date;
}

export interface CreateSubscriptionDTO {
  readerId: ReaderId;
  bookId: BookId;
  status: SubscriptionStatus;
  orderId: OrderId;
  accessExpiresAt?: Date;
}
