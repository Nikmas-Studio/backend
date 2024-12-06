import { ReaderId } from '../reader/types.ts';
import { AuthToken, AuthTokenId, Session, SessionId } from './types.ts';

export interface AuthRepository {
  createAuthToken(readerId: ReaderId): Promise<AuthToken>;
  getAuthTokenById(authTokenId: AuthTokenId): Promise<AuthToken | null>;
  removeAuthToken(authTokenId: AuthTokenId): Promise<void>;
  createSession(readerId: ReaderId): Promise<Session>;
  getSessionById(sessionId: SessionId): Promise<Session | null>;
  getAllReaderSessions(readerId: ReaderId): Promise<SessionId[]>;
  updateSession(newSession: Session): Promise<void>;
  removeSession(sessionId: SessionId, readerId: ReaderId): Promise<void>;
}
