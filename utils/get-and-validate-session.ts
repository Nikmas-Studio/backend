import { HTTPException } from 'hono/http-exception';
import { Session, SessionId } from '../models/auth/types.ts';
import { getCookie } from 'hono/cookie';
import { STATUS_CODE } from '@std/http/status';
import { Context } from 'hono';
import { SESSION_ID_COOKIE_NAME } from '../constants.ts';
import { AuthRepository } from '../models/auth/repository-interface.ts';

export async function getAndValidateSession(
  c: Context,
  authRepository: AuthRepository,
): Promise<Session> {
  const sessionId = getCookie(c, SESSION_ID_COOKIE_NAME);
  if (sessionId === undefined) {
    throw new HTTPException(STATUS_CODE.Unauthorized);
  }

  const session = await authRepository.getSessionById(
    sessionId as SessionId,
  );

  if (session === null) {
    throw new HTTPException(STATUS_CODE.Unauthorized);
  }

  return session;
}
