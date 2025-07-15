import { BookId } from '../models/book/types.ts';
import { ReaderId } from '../models/reader/types.ts';
import { SubscriptionRepository } from '../models/subscription/repository-interface.ts';
import { SubscriptionId } from '../models/subscription/types.ts';

function calculateCreditsNeeded(
  fragment: string,
  context: string,
  targetLanguage: string,
  translationRefinement: boolean,
): number {
  const systemContent = translationRefinement
    ? 'You are the most precise translation checker. If the given Translation is 100% accurate for the Fragment in Context, return it unchanged. Otherwise, return a corrected version ONLY'
    : 'You are the most precise translation tool. Return ONLY the translation of the given Fragment, using the Context to disambiguate the meaning';

  const userContent = translationRefinement
    ? `Fragment: ${fragment}\nContext: ${context}\nTranslation: ${fragment}\nTarget language: ${targetLanguage}`
    : `Fragment: ${fragment}\nContext: ${context}\nTranslate to: ${targetLanguage}`;

  const totalInputChars = systemContent.length + userContent.length;

  const estimatedInputTokens = Math.ceil(totalInputChars / 4);
  const estimatedOutputTokens = Math.ceil(fragment.length / 4);

  const inputCost = estimatedInputTokens * (0.40 / 1_000_000);
  const outputCost = estimatedOutputTokens * (1.60 / 1_000_000);

  const totalCost = inputCost + outputCost;

  return totalCost;
}

export async function checkAndUpdateTranslationCredits(
  fragment: string,
  context: string,
  targetLanguage: string,
  connection: SubscriptionId | { readerId: ReaderId; bookId: BookId },
  subscriptionRepository: SubscriptionRepository,
  creditsToGrantOnUpdate: number,
  translationRefinement: boolean,
): Promise<{ enoughCredits: boolean }> {
  const translationPrice = calculateCreditsNeeded(
    fragment,
    context,
    targetLanguage,
    translationRefinement,
  );

  return await subscriptionRepository.checkAndUpdateTranslationCredits(
    connection,
    translationPrice,
    creditsToGrantOnUpdate,
  );
}
