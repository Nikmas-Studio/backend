import {
  ReaderExistsError,
  ReaderNotFoundError,
  RemoveReaderError,
} from '../../errors.ts';
import { Email } from '../../global-types.ts';
import { generateUUID } from '../../utils/generate-uuid.ts';
import { logDebug, logError, logInfo } from '../../utils/logger.ts';
import { ReaderRepository } from './repository-interface.ts';
import {
  CreateOrUpdateReaderProfileDTO,
  CreateReaderDTO,
  FullAccessReader,
  Investor,
  Reader,
  ReaderId,
  ReaderProfile,
  ReaderStatuses,
} from './types.ts';

export class ReaderDenoKvRepository implements ReaderRepository {
  constructor(private kv: Deno.Kv) {}

  async createReader(
    {
      email,
      isInvestor,
      hasFullAccess,
    }: CreateReaderDTO,
  ): Promise<Reader> {
    const readerId = generateUUID() as ReaderId;
    const createdAt = new Date();
    const reader: Reader = {
      id: readerId,
      email,
      emailConfirmed: false,
      createdAt,
    };

    const primaryKey = ['readers', reader.id];
    const byEmailKey = ['readers_by_email', reader.email];

    const atomicOp = this.kv.atomic()
      .check({ key: byEmailKey, versionstamp: null })
      .set(primaryKey, reader)
      .set(byEmailKey, reader.id);

    if (isInvestor) {
      const investorKey = ['investors', reader.id];

      atomicOp.set(investorKey, true);
    }

    if (hasFullAccess) {
      const fullAccessReaderKey = ['full_access_readers', reader.id];

      atomicOp.set(fullAccessReaderKey, true);
    }

    const res = await atomicOp.commit();

    if (!res.ok) {
      logError(`reader exists kv error: ${email}`);
      throw new ReaderExistsError(reader.email);
    }

    logInfo(`reader created: ${JSON.stringify(reader)}`);

    return reader;
  }

  async getReaderById(readerId: ReaderId): Promise<Reader | null> {
    const reader = await this.kv.get<Reader>(['readers', readerId]);
    return reader.value;
  }

  async getReaderByEmail(
    email: Email,
  ): Promise<Reader | null> {
    const reader = await this.kv.get<ReaderId>(['readers_by_email', email]);

    if (reader.value === null) {
      return null;
    }

    return this.getReaderById(reader.value);
  }

  async getOrCreateReader(createReaderDTO: CreateReaderDTO): Promise<Reader> {
    const reader = await this.getReaderByEmail(createReaderDTO.email);

    if (reader !== null) {
      logInfo(`found reader: ${JSON.stringify(reader)}`);
      return reader;
    }

    return this.createReader(createReaderDTO);
  }

  async getReaderStatuses(readerId: ReaderId): Promise<ReaderStatuses | null> {
    const reader = await this.getReaderById(readerId);

    if (reader === null) {
      return null;
    }

    const isInvestor = await this.kv.get<Investor>(['investors', readerId]);
    const hasFullAccess = await this.kv.get<FullAccessReader>([
      'full_access_readers',
      readerId,
    ]);

    return {
      isInvestor: isInvestor.value !== null,
      hasFullAccess: hasFullAccess.value !== null,
    };
  }

  async confirmReaderEmail(readerId: ReaderId): Promise<void> {
    const reader = await this.getReaderById(readerId);

    if (reader === null) {
      logError(`confirmReaderEmail: reader not found: ${readerId}`);
      throw new ReaderNotFoundError(readerId);
    }

    const key = ['readers', readerId];
    const updatedReader: Reader = { ...reader, emailConfirmed: true };

    await this.kv.set(key, updatedReader);
  }

  async getAllReaders(): Promise<Reader[]> {
    const iter = this.kv.list<Reader>({ prefix: ['readers'] });
    const readers: Reader[] = [];
    for await (const reader of iter) {
      readers.push(reader.value);
    }

    return readers;
  }

  async removeReader(readerId: ReaderId): Promise<void> {
    const reader = await this.getReaderById(readerId);

    if (reader === null) {
      logDebug(`removeReader: reader not found: ${readerId}`);
      return;
    }

    const primaryKey = ['readers', readerId];
    const byEmailKey = ['readers_by_email', reader.email];
    const investorKey = ['investors', readerId];
    const fullAccessReaderKey = ['full_access_readers', readerId];

    const res = await this.kv.atomic()
      .delete(primaryKey)
      .delete(byEmailKey)
      .delete(investorKey)
      .delete(fullAccessReaderKey)
      .commit();

    if (!res.ok) {
      logError(`removeReader kv atomicOp error: ${readerId}`);
      throw new RemoveReaderError(readerId);
    }
  }

  async createOrUpdateReaderProfile(
    readerId: ReaderId,
    createReaderProfileDTO: CreateOrUpdateReaderProfileDTO,
  ): Promise<ReaderProfile> {
    const reader = await this.getReaderById(readerId);

    if (reader === null) {
      logError(`createReaderProfile: reader not found: ${readerId}`);
      throw new ReaderNotFoundError(readerId);
    }
    
    const existingReaderProfile = await this.getReaderProfile(readerId);
    
    let readerProfile: ReaderProfile;
    
    if (existingReaderProfile !== null) {
      readerProfile = { ...existingReaderProfile, fullName: createReaderProfileDTO.fullName };
    } else {
      readerProfile = {
        fullName: createReaderProfileDTO.fullName,
        createdAt: new Date(),
      };
    }

    await this.kv.set(['reader_profiles', readerId], readerProfile);

    return readerProfile;
  }

  async getReaderProfile(readerId: ReaderId): Promise<ReaderProfile | null> {
    const readerProfile = await this.kv.get<ReaderProfile>([
      'reader_profiles',
      readerId,
    ]);
    return readerProfile.value;
  }

  async updateReaderFullName(
    readerId: ReaderId,
    fullName: string,
  ): Promise<void> {
    await this.createOrUpdateReaderProfile(readerId, { fullName });
  }
}
