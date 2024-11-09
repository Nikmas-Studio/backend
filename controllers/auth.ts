import { STATUS_CODE } from '@std/http';
import { Context, TypedResponse } from 'hono';
import { setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import { AuthRepository } from '../models/auth/repository-interface.ts';
import { AuthTokenId } from '../models/auth/types.ts';
import { ReaderRepository } from '../models/reader/repository-interface.ts';
import { LoginDTO } from '../route-payload-dtos/login.ts';
import { ValidateAuthTokenDTO } from '../route-payload-dtos/validate-auth-token.ts';
import { EmailService } from '../services/email/email-service-interface.ts';
import { generateLoginLink } from '../utils/generate-login-link.ts';
import { logError, logInfo } from '../utils/logger.ts';
import { MAX_READER_SESSIONS } from '../constants.ts';

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

    const authToken = await this.authRepository.getAuthTokenById(authTokenId);

    if (authToken === null) {
      logError(`auth token ${authTokenId} not found`);
      throw new HTTPException(STATUS_CODE.Unauthorized);
    }

    if (new Date() > authToken.expiresAt) {
      logError(`auth token ${authTokenId} has expired`);
      throw new HTTPException(STATUS_CODE.Unauthorized);
    }

    await this.authRepository.removeAuthToken(authTokenId);

    const allReaderSessions = await this.authRepository.getAllReaderSessions(
      authToken.readerId,
    );

    if (allReaderSessions.length === MAX_READER_SESSIONS) {
      logInfo(
        `reader ${authToken.readerId} has reached the maximum number of sessions`,
      );
      logInfo(`session id to remove: ${allReaderSessions[0]}`);
      await this.authRepository.removeSession(
        allReaderSessions[0],
        authToken.readerId,
      );
    }

    const newSession = await this.authRepository.createSession(
      authToken.readerId,
    );

    setCookie(c, 'sessionId', newSession.id, {
      httpOnly: true,
      sameSite: 'Lax',
      secure: true,
      path: '/',
      maxAge: 34560000,
    });

    logInfo(
      `session ${newSession.id} created for reader ${authToken.readerId} and cookie set`,
    );

    return c.json({
      message: 'auth token validated successfully',
    }, STATUS_CODE.OK);
  }
}
