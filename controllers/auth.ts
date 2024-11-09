import { Email } from '../global-types.ts';
import { AuthRepository } from '../models/auth/repository-interface.ts';
import { ReaderRepository } from '../models/reader/repository-interface.ts';
import { EmailService } from '../services/email/email-service-interface.ts';
import { generateLoginLink } from '../utils/generate-login-link.ts';
import { HTTPException } from 'hono/http-exception';
import { STATUS_CODE } from '@std/http';

export class AuthController {
  constructor(
    private authRepository: AuthRepository,
    private readerRepository: ReaderRepository,
    private emailService: EmailService,
  ) {}

  async login(readerEmail: Email): Promise<void> {
    const reader = await this.readerRepository.getOrCreateReader({
      email: readerEmail,
      isInvestor: true,
      hasFullAccess: false,
    });
    const authToken = await this.authRepository.createAuthToken(reader.id);
    const loginLink = generateLoginLink(authToken.id);

    try {
      await this.emailService.sendLoginLink({ readerEmail, link: loginLink });
    } catch (_e) {
      throw new HTTPException(STATUS_CODE.InternalServerError);
    }
  }
}
