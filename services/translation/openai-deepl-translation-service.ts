import OpenAI from 'openai';
import { TranslationError } from '../../errors.ts';
import { logError } from '../../utils/logger.ts';
import { TranslationService } from './translation-service-interface.ts';
import { TranslateDTO, Translation } from './types.ts';
import { deeplTranslate } from '../../utils/deepl-translate.ts';

export class OpenaiDeeplTranslationService implements TranslationService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });
  }

  async translate(
    { targetLanguage, context, fragment }: TranslateDTO,
  ): Promise<Translation> {
    try {
      const systemContent =
        'You are the most precise translation tool. Return ONLY the translation of the given Fragment, using the Context to disambiguate the meaning';
      const userContent =
        `Fragment: ${fragment}\nContext: ${context}\nTranslate to: ${targetLanguage}`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        store: true,
        messages: [
          {
            'role': 'system',
            'content': systemContent,
          },
          {
            'role': 'user',
            'content': userContent,
          },
        ],
      });

      const reply = completion.choices[0].message.content;
      if (reply === null) {
        logError(`OpenAI translation returned null content`);
        throw new TranslationError('OpenAI translation returned null content');
      }

      return reply;
    } catch (e) {
      logError(`OpenAI translation error: ${e}`);

      try {
        const reply = await deeplTranslate({
          targetLanguage,
          context,
          fragment,
        });
        
        return reply;
      } catch (e) {
        logError(`DeepL translation error: ${e}`);
        throw new TranslationError('DeepL translation error', e as Error);
      }
    }
  }
}
