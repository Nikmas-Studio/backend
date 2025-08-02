import OpenAI from 'openai';
import { TranslationError } from '../../errors.ts';
import { deeplTranslate } from '../../utils/deepl-translate.ts';
import { logError } from '../../utils/logger.ts';
import { TranslationService } from './translation-service-interface.ts';
import { RefineTranslationDTO, TranslateDTO, Translation } from './types.ts';

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
        'You are the most precise translation tool. Translate ONLY the given Fragment, using Context SOLELY for disambiguation. Do not include any words outside the Fragment. Output ONLY the translated Fragment';
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

  async refineTranslation(
    { targetLanguage, context, fragment, translation }: RefineTranslationDTO,
  ): Promise<Translation> {
    try {
      const systemContent =
        'You are the most precise translation checker. If the given Translation is 100% accurate for the Fragment in Context, return it unchanged. Otherwise, return a corrected version — but do not add anything beyond the Fragment’s boundaries';

      const userContent =
        `Fragment: ${fragment}\nContext: ${context}\nTranslation: ${translation}\nTarget language: ${targetLanguage}`;

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
      logError(`OpenAI translation refinement error: ${e}`);
      throw new TranslationError(
        'OpenAI translation refinement error',
        e as Error,
      );
    }
  }
}
