import { AUTH_TOKEN_TTL } from '../../constants.ts';
import { SessionNotFoundError } from '../../errors.ts';
import { generateUUID } from '../../utils/generate-uuid.ts';
import { logInfo } from '../../utils/logger.ts';
import { ReaderId } from '../reader/types.ts';
import { AuthRepository } from './repository-interface.ts';
import { AuthToken, AuthTokenId, Session, SessionId } from './types.ts';

export class AuthDenoKvRepository implements AuthRepository {
  constructor(private kv: Deno.Kv) {}

  async createAuthToken(readerId: ReaderId): Promise<AuthToken> {
    const authTokenId = generateUUID() as AuthTokenId;

    const authToken: AuthToken = {
      id: authTokenId,
      readerId,
      createdAt: new Date(),
    };

    const primaryKey = ['auth_tokens', authToken.id];

    await this.kv.set(primaryKey, authToken, { expireIn: AUTH_TOKEN_TTL });

    logInfo(`auth token created: ${JSON.stringify(authToken)}`);

    return authToken;
  }

  async getAuthTokenById(authTokenId: AuthTokenId): Promise<AuthToken | null> {
    const authToken = await this.kv.get<AuthToken>([
      'auth_tokens',
      authTokenId,
    ]);
    return authToken.value;
  }

  async removeAuthToken(authTokenId: AuthTokenId): Promise<void> {
    await this.kv.delete(['auth_tokens', authTokenId]);
  }

  async createSession(readerId: ReaderId): Promise<Session> {
    const sessionId = generateUUID() as SessionId;

    const session: Session = {
      id: sessionId,
      readerId,
      accessToken: generateUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const primaryKey = ['sessions', session.id];
    const byReaderKey = ['sessions_by_reader', readerId, sessionId];

    await this.kv.atomic()
      .set(primaryKey, session)
      .set(byReaderKey, null)
      .commit();

    logInfo(`session created: ${JSON.stringify(session)}`);

    return session;
  }

  async getSessionById(sessionId: SessionId): Promise<Session | null> {
    const session = await this.kv.get<Session>(['sessions', sessionId]);
    return session.value;
  }

  async getAllReaderSessions(readerId: ReaderId): Promise<SessionId[]> {
    const sessions: SessionId[] = [];
    for await (
      const { key, value: _ } of this.kv.list<SessionId>({
        prefix: ['sessions_by_reader', readerId],
      })
    ) {
      sessions.push(key[2] as SessionId);
    }
    return sessions;
  }

  async removeSession(sessionId: SessionId, readerId: ReaderId): Promise<void> {
    await this.kv.atomic()
      .delete(['sessions', sessionId])
      .delete(['sessions_by_reader', readerId, sessionId])
      .commit();
  }

  async updateSession(newSession: Session): Promise<void> {
    const existingSession = await this.kv.get<Session>([
      'sessions',
      newSession.id,
    ]);

    if (existingSession.value === null) {
      throw new SessionNotFoundError(newSession.id);
    }

    const primaryKey = ['sessions', newSession.id];

    await this.kv.set(primaryKey, newSession);
  }
}
