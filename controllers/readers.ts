import { AuthRepository } from '../models/auth/repository-interface.ts';
import { ReaderRepository } from '../models/reader/repository-interface.ts';
import { Context, TypedResponse } from 'hono';
import { getAndValidateSession } from '../utils/get-and-validate-session.ts';
import { UpdateReaderFullNameDTO } from '../routes-dtos/update-reader-full-name.ts';
import { STATUS_CODE } from '@std/http';

export class ReadersController {
  constructor(
    private readerRepository: ReaderRepository,
    private authRepository: AuthRepository,
  ) {}

  async updateReaderFullName(
    c: Context,
    { fullName }: UpdateReaderFullNameDTO,
  ): Promise<TypedResponse> {
    const session = await getAndValidateSession(c, this.authRepository);
    await this.readerRepository.createOrUpdateReaderProfile(session.readerId, {
      fullName,
    });

    return c.json({
      message: 'Full name updated',
    }, STATUS_CODE.OK);
  }
}
