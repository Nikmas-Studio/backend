import { STATUS_CODE } from '@std/http/status';
import { Context } from 'hono';
import { setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import {
  MAX_READER_SESSIONS,
  SESSION_ACCESS_TOKEN_COOKIE_NAME,
  SESSION_ID_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from '../constants.ts';
import { AuthRepository } from '../models/auth/repository-interface.ts';
import { AuthTokenId, Session } from '../models/auth/types.ts';
import { logError, logInfo } from './logger.ts';

export async function validateAuthTokenAndCreateSession(
  c: Context,
  authTokenId: AuthTokenId,
  authRepository: AuthRepository,
): Promise<Session> {
  const authToken = await authRepository.getAuthTokenById(authTokenId);

  if (authToken === null) {
    logError(`auth token ${authTokenId} not found`);
    throw new HTTPException(STATUS_CODE.Unauthorized);
  }

  await authRepository.removeAuthToken(authTokenId);

  const allReaderSessions = await authRepository.getAllReaderSessions(
    authToken.readerId,
  );
  
  console.log('allReaderSessions:', allReaderSessions);
  console.log('allReaderSessions.length:', allReaderSessions.length);

  if (allReaderSessions.length === MAX_READER_SESSIONS) {
    logInfo(
      `reader ${authToken.readerId} has reached the maximum number of sessions`,
    );
    logInfo(`session id to remove: ${allReaderSessions[0]}`);
    await authRepository.removeSession(
      allReaderSessions[0],
      authToken.readerId,
    );
  }

  const newSession = await authRepository.createSession(
    authToken.readerId,
  );

  setCookie(c, SESSION_ID_COOKIE_NAME, newSession.id, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: true,
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  setCookie(c, SESSION_ACCESS_TOKEN_COOKIE_NAME, newSession.accessToken, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: true,
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  logInfo(
    `session ${newSession.id} created for reader ${newSession.readerId} and cookie set`,
  );

  return newSession;
}
