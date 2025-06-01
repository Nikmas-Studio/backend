import { z } from 'zod';
import { MAX_TRANSLATION_FRAGMENT_LENGTH } from '../constants.ts';

export const TranslateDTOSchema = z.object({
  bookURI: z.string(),
  targetLanguage: z.string(),
  context: z.string().trim(),
  fragment: z.string().trim().max(MAX_TRANSLATION_FRAGMENT_LENGTH),
});

export type TranslateDTO = z.infer<typeof TranslateDTOSchema>;
