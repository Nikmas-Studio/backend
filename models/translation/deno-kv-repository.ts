import { TranslationRepository } from './repository-interface.ts';
import { AddTranslationDTO, GetTranslationDTO, Translation } from './types.ts';

export class TranslationDenoKvRepository implements TranslationRepository {
  constructor(private kv: Deno.Kv) {}

  async addTranslation(
    { bookURI, targetLanguage, fragment, context, translation }: AddTranslationDTO,
  ): Promise<Translation> {
    const newTranslationObj: Translation = {
      bookURI,
      targetLanguage,
      fragment,
      context,
      translation,
      lastCheckedAt: new Date(),
      numberOfQualityChecks: 0,
    };

    const primaryKey = [
      'translations',
      bookURI,
      targetLanguage,
      fragment,
      context,
    ];

    const res = await this.kv.atomic()
      .check({ key: primaryKey, versionstamp: null })
      .set(primaryKey, newTranslationObj)
      .commit();

    if (!res.ok) {
      const existingTranslationObj = await this.getTranslation({
        bookURI,
        targetLanguage,
        context,
        fragment,
      });
      return existingTranslationObj!;
    }

    return newTranslationObj;
  }

  async getTranslation(
    { bookURI, targetLanguage, context, fragment }: GetTranslationDTO,
  ): Promise<Translation | null> {
    const translationObj = await this.kv.get<Translation>([
      'translations',
      bookURI,
      targetLanguage,
      fragment,
      context,
    ]);

    return translationObj.value;
  }
}
