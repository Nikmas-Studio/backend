import { Branded, UUID } from '../../global-types.ts';

export type AuthTokenId = Branded<UUID, 'AuthTokenId'>;

export interface AuthToken {
  id: AuthTokenId;
  readerId: UUID;
  createdAt: Date;
  expiresAt: Date;
}
