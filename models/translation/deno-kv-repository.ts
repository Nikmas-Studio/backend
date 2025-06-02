import { generateUUID } from '../../utils/generate-uuid.ts';
import { TranslationRepository } from './repository-interface.ts';
import {
  AddTranslationDTO,
  GetTranslationDTO,
  Translation,
  TranslationId,
} from './types.ts';

export class TranslationDenoKvRepository implements TranslationRepository {
  constructor(private kv: Deno.Kv) {}

  async addTranslation(
    { bookURI, targetLanguage, fragment, context, story, translation }:
      AddTranslationDTO,
  ): Promise<Translation> {
    const newTranslationObj: Translation = {
      id: generateUUID() as TranslationId,
      bookURI,
      targetLanguage,
      fragment,
      context,
      story,
      translation,
      lastQualityCheckAt: null,
      numberOfQualityChecks: 0,
    };

    const primaryKey = ['translations', newTranslationObj.id];

    const byDetailsKey = [
      'translations_by_details',
      bookURI,
      targetLanguage,
      fragment,
      context,
      story,
    ];

    const res = await this.kv.atomic()
      .check({ key: byDetailsKey, versionstamp: null })
      .set(primaryKey, newTranslationObj)
      .set(byDetailsKey, newTranslationObj.id)
      .commit();
      
    if (!res.ok) {
      const existingTranslationObj = await this.getTranslationByDetails({
        bookURI,
        targetLanguage,
        context,
        fragment,
        story,
      });
      return existingTranslationObj!;
    }

    return newTranslationObj;
  }

  async getTranslationByDetails(
    { bookURI, targetLanguage, context, fragment, story }: GetTranslationDTO,
  ): Promise<Translation | null> {
    const translationId = await this.kv.get<TranslationId>([
      'translations_by_details',
      bookURI,
      targetLanguage,
      fragment,
      context,
      story,
    ]);

    if (translationId.value === null) {
      return null;
    }

    return this.getTranslationById(translationId.value);
  }

  async getTranslationById(
    translationId: TranslationId,
  ): Promise<Translation | null> {
    const translationObj = await this.kv.get<Translation>([
      'translations',
      translationId,
    ]);

    return translationObj.value;
  }
}
