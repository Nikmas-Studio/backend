import { PEDNDING_SUBSCRIPTION_TTL } from '../constants.ts';
import { SubscriptionRepository } from '../models/subscription/repository-interface.ts';
import { SubscriptionStatus } from '../models/subscription/types.ts';

export async function removeExpiredPendingSubscriptions(
  subscriptionRepository: SubscriptionRepository,
): Promise<void> {
  const allSubscriptions = await subscriptionRepository.getAllSubscriptions();
  for (const subscription of allSubscriptions) {
    if (subscription.status === SubscriptionStatus.PENDING) {
      const diffInMs = new Date().getTime() - subscription.createdAt.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
      if (diffInDays >= PEDNDING_SUBSCRIPTION_TTL) {
        await subscriptionRepository.removeSubscription(subscription);
        console.log(
          `CRON: Removed expired pending subscription: ${
            JSON.stringify(subscription)
          }. Subscription was created on ${subscription.createdAt}: ${diffInDays} days ago.`,
        )
      }
    }
  }
}
