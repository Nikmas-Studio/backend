import { STATUS_CODE } from '@std/http';
import { Context, TypedResponse } from 'hono';
import { deleteCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import {
  IS_INVESTOR_BY_DEFAULT,
  SESSION_ID_COOKIE_NAME,
} from '../constants.ts';
import { AuthRepository } from '../models/auth/repository-interface.ts';
import { AuthTokenId } from '../models/auth/types.ts';
import { ReaderRepository } from '../models/reader/repository-interface.ts';
import { LoginDTO } from '../routes-dtos/login.ts';
import { ValidateAuthTokenDTO } from '../routes-dtos/validate-auth-token.ts';
import { EmailService } from '../services/email/email-service-interface.ts';
import { LinkType } from '../services/email/types.ts';
import { generateLoginLink } from '../utils/generate-login-link.ts';
import { getAndValidateSession } from '../utils/get-and-validate-session.ts';
import { logInfo } from '../utils/logger.ts';
import { validateAuthTokenAndCreateSession } from '../utils/validate-auth-token-and-create-session.ts';

export class AuthController {
  constructor(
    private authRepository: AuthRepository,
    private readerRepository: ReaderRepository,
    private emailService: EmailService,
  ) {}

  async login(c: Context, payload: LoginDTO): Promise<TypedResponse> {
    const readerEmail = payload.email;
    logInfo(`login request for ${readerEmail}`);

    const reader = await this.readerRepository.getOrCreateReader({
      email: readerEmail,
      isInvestor: IS_INVESTOR_BY_DEFAULT,
      hasFullAccess: false,
    });
    const authToken = await this.authRepository.createAuthToken(reader.id);
    const loginLink = generateLoginLink(authToken.id);

    try {
      await this.emailService.sendLink({
        readerEmail,
        link: loginLink,
        linkType: LinkType.LOGIN,
      });
    } catch (_) {
      throw new HTTPException(STATUS_CODE.InternalServerError);
    }

    logInfo(`Login link sent to ${readerEmail}. Link: ${loginLink}`);

    return c.json({
      message: 'login link sent successfully',
    }, STATUS_CODE.OK);
  }

  async validateAuthToken(
    c: Context,
    payload: ValidateAuthTokenDTO,
  ): Promise<TypedResponse> {
    const authTokenId = payload.authToken as AuthTokenId;
    logInfo(`validate auth token request for ${authTokenId}`);

    await validateAuthTokenAndCreateSession(
      c,
      authTokenId,
      this.authRepository,
    );

    return c.json({
      message: 'auth token validated successfully',
    }, STATUS_CODE.OK);
  }

  async logout(c: Context): Promise<TypedResponse> {
    const session = await getAndValidateSession(c, this.authRepository);
    this.authRepository.removeSession(session.id, session.readerId);
    deleteCookie(c, SESSION_ID_COOKIE_NAME);

    return c.json({
      message: 'logout successful',
    }, STATUS_CODE.OK);
  }
}
