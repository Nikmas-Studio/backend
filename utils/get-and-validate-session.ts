import { STATUS_CODE } from '@std/http/status';
import { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import {
  REUSE_DETECTION_THRESHOLD,
  SESSION_ACCESS_TOKEN_COOKIE_NAME,
  SESSION_ACCESS_TOKEN_TTL,
  SESSION_ID_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from '../constants.ts';
import { AuthRepository } from '../models/auth/repository-interface.ts';
import { Session, SessionId } from '../models/auth/types.ts';
import { generateUUID } from './generate-uuid.ts';
import { logError, logInfo } from './logger.ts';

export async function getAndValidateSession(
  c: Context,
  authRepository: AuthRepository,
  bySessionId?: {
    sessionId: string | undefined;
  },
): Promise<Session> {
  let sessionId: string | undefined;
  let sessionAccessToken: string | undefined;
  if (bySessionId === undefined) {
    sessionId = getCookie(c, SESSION_ID_COOKIE_NAME) as SessionId;
    sessionAccessToken = getCookie(c, SESSION_ACCESS_TOKEN_COOKIE_NAME);
  } else {
    sessionId = bySessionId?.sessionId;
  }

  if (sessionId === undefined) {
    throw new HTTPException(STATUS_CODE.Unauthorized);
  }

  if (bySessionId === undefined && sessionAccessToken === undefined) {
    throw new HTTPException(STATUS_CODE.Unauthorized);
  }

  let session = await authRepository.getSessionById(
    sessionId as SessionId,
  );

  if (session === null) {
    throw new HTTPException(STATUS_CODE.Unauthorized);
  }

  // TODO: Fix occasional improper triggering of malicious activity detection for auth tokens
  // if (bySessionId === undefined) {
  //   if (session.accessToken !== sessionAccessToken) {
  //     if (
  //       (Date.now() - session.updatedAt.getTime()) >
  //         REUSE_DETECTION_THRESHOLD
  //     ) {
  //       logError(
  //         `malicious activity detected: session access token mismatch for reader ${session.readerId};
  //          session.access_token: ${session.accessToken}; session_access_token_cookie: ${sessionAccessToken}`,
  //       );
  //       await authRepository.removeSession(session.id, session.readerId);
  //       throw new HTTPException(STATUS_CODE.Unauthorized);
  //     }
  //   }
  // }

  if (bySessionId === undefined) {
    if ((Date.now() - session.updatedAt.getTime()) > SESSION_ACCESS_TOKEN_TTL) {
      logInfo(`session access token expired`);

      const newAccessToken = generateUUID();
      const updatedSession: Session = {
        ...session,
        accessToken: newAccessToken,
        updatedAt: new Date(),
      };
      session = updatedSession;

      await authRepository.updateSession(updatedSession);

      setCookie(c, SESSION_ACCESS_TOKEN_COOKIE_NAME, newAccessToken, {
        httpOnly: true,
        sameSite: 'Lax',
        secure: true,
        path: '/',
        maxAge: SESSION_MAX_AGE_SECONDS,
      });
    }
  }

  return session;
}
