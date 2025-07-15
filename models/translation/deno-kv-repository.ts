import { generateUUID } from '../../utils/generate-uuid.ts';
import { ReaderId } from '../reader/types.ts';
import { TranslationRepository } from './repository-interface.ts';
import {
  AddTranslationDTO,
  GetTranslationDTO,
  Translation,
  TranslationId,
  UpdateTranslationDTO,
} from './types.ts';

export class TranslationDenoKvRepository implements TranslationRepository {
  constructor(private kv: Deno.Kv) {}

  async addTranslation(
    { bookURI, targetLanguage, fragment, context, bookPart, translation }:
      AddTranslationDTO,
  ): Promise<Translation> {
    const newTranslationObj: Translation = {
      id: generateUUID() as TranslationId,
      bookURI,
      targetLanguage,
      fragment,
      context,
      bookPart,
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
      bookPart,
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
        bookPart,
      });
      return existingTranslationObj!;
    }

    return newTranslationObj;
  }

  async getTranslationByDetails(
    { bookURI, targetLanguage, context, fragment, bookPart }: GetTranslationDTO,
  ): Promise<Translation | null> {
    const translationId = await this.kv.get<TranslationId>([
      'translations_by_details',
      bookURI,
      targetLanguage,
      fragment,
      context,
      bookPart,
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
   
  async saveReaderTranslation(translationId: TranslationId, readerId: ReaderId): Promise<void> {
    await this.kv.set(['reader_translations', readerId, translationId], true);
  }

  async updateTranslation({ translationId, refinedTranslation, numberOfQualityChecks, lastQualityCheckAt }: UpdateTranslationDTO): Promise<Translation> {
    const translation = await this.getTranslationById(translationId);

    if (!translation) {
      throw new Error('Translation not found');
    }

    const updatedTranslation: Translation = {
      ...translation,
      translation: refinedTranslation,
      numberOfQualityChecks,
      lastQualityCheckAt,
    };

    await this.kv.set(['translations', translationId], updatedTranslation);
    return updatedTranslation;
  }
}
