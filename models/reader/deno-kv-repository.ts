import { ReaderExistsError } from '../../errors.ts';
import { Email } from '../../global-types.ts';
import { generateUUID } from '../../utils/generate-uuid.ts';
import { logError, logInfo } from '../../utils/logger.ts';
import { ReaderRepository } from './repository-interface.ts';
import {
  CreateReaderDTO,
  FullAccessReader,
  Investor,
  Reader,
  ReaderId,
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
      createdAt,
    };

    const primaryKey = ['readers', reader.id];
    const byEmailKey = ['readers_by_email', reader.email];

    const atomicOp = this.kv.atomic()
      .check({ key: byEmailKey, versionstamp: null })
      .set(primaryKey, reader)
      .set(byEmailKey, reader.id);

    if (isInvestor) {
      const investor: Investor = {
        readerId: reader.id,
        createdAt,
      };

      const investorKey = ['investors', reader.id];

      atomicOp.set(investorKey, investor);
    }

    if (hasFullAccess) {
      const fullAccessReader: FullAccessReader = {
        readerId: reader.id,
        createdAt,
      };

      const fullAccessReaderKey = ['full_access_readers', reader.id];

      atomicOp.set(fullAccessReaderKey, fullAccessReader);
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
    const hasFullAccess = await this.kv.get<FullAccessReader>(['full_access_readers', readerId]);
    
    return {
      isInvestor: isInvestor.value !== null,
      hasFullAccess: hasFullAccess.value !== null,
    }
  }
}
