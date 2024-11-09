import { ReaderId } from '../reader/types.ts';
import { AuthToken, AuthTokenId, Session, SessionId } from './types.ts';

export interface AuthRepository {
  createAuthToken(readerId: ReaderId): Promise<AuthToken>;
  getAuthTokenById(authTokenId: AuthTokenId): Promise<AuthToken | null>;
  createSession(readerId: ReaderId): Promise<Session>;
  getAllReaderSessions(readerId: ReaderId): Promise<SessionId[]>;
  removeSession(sessionId: SessionId): Promise<void>;
}
