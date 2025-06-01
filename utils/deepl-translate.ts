import { LANGUAGE_MAPPINGS } from '../constants.ts';
import { TranslateDTO, Translation } from '../services/translation/types.ts';

export async function deeplTranslate(
  { targetLanguage, context, fragment }: TranslateDTO,
): Promise<Translation> {
  const resp = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `DeepL-Auth-Key ${Deno.env.get('DEEPL_API_KEY')}`,
    },
    body: JSON.stringify({
      text: [fragment],
      source_lang: 'EN',
      target_lang: LANGUAGE_MAPPINGS[targetLanguage],
      context,
      model_type: 'prefer_quality_optimized',
    }),
  });

  const respBody = await resp.json();
  return respBody.translations[0].text;
}
