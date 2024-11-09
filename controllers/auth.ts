import { Email } from '../general-types.ts';
import { AuthRepository } from '../models/auth/repository-interface.ts';
import { ReaderRepository } from '../models/reader/repository-interface.ts';
import { generateLoginLink } from '../utils/generateLoginLink.ts';

export class AuthController {
  constructor(
    private authRepository: AuthRepository,
    private readerRepository: ReaderRepository,
  ) {}

  async login(readerEmail: Email): Promise<void> {
    const reader = await this.readerRepository.getOrCreateReader({
      email: readerEmail,
      isInvestor: true,
      hasFullAccess: false,
    });
    const authToken = await this.authRepository.createAuthToken(reader.id);
    const _loginLink = generateLoginLink(authToken.id);
  }
}
