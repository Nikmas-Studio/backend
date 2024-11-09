import { Branded, UUID } from '../../global-types.ts';
import { ReaderId } from '../reader/types.ts';

export type AuthTokenId = Branded<UUID, 'AuthTokenId'>;

export interface AuthToken {
  id: AuthTokenId;
  readerId: ReaderId;
  createdAt: Date;
  expiresAt: Date;
}

export type SessionId = Branded<UUID, 'SessionId'>;

export interface Session {
  id: SessionId;
  readerId: ReaderId;
  createdAt: Date;
}
