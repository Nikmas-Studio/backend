import { ReaderExistsError } from '../../errors.ts';
import { generateUUID } from '../../utils/generateUUID.ts';
import { ReaderRepository } from './repository-interface.ts';
import {
  CreateReaderDTO,
  FullAccessReader,
  Investor,
  Reader,
  ReaderEmail,
  ReaderId,
} from './types.ts';

export class ReaderDenoKVRepository implements ReaderRepository {
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

    const atomicOp = await this.kv.atomic()
      .check({ key: byEmailKey, versionstamp: null })
      .set(primaryKey, reader)
      .set(byEmailKey, reader);

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
      throw new ReaderExistsError(reader.email);
    }

    return reader;
  }

  async getReaderByEmail(
    email: ReaderEmail,
  ): Promise<Reader | null> {
    const reader = await this.kv.get<Reader>(['readers_by_email', email]);

    return reader.value;
  }

  async getOrCreateReader(createReaderDTO: CreateReaderDTO): Promise<Reader> {
    const reader = await this.getReaderByEmail(createReaderDTO.email);

    if (reader) {
      return reader;
    }

    return this.createReader(createReaderDTO);
  }
}
