import { AUTH_TOKEN_TIME_TO_LIVE } from '../../constants.ts';
import { generateUUID } from '../../utils/generateUUID.ts';
import { ReaderId } from '../reader/types.ts';
import { AuthRepository } from './repository-interface.ts';
import { AuthToken, AuthTokenId } from './types.ts';

export class AuthDenoKVRepository implements AuthRepository {
  constructor(private kv: Deno.Kv) {}

  async createAuthToken(readerId: ReaderId): Promise<AuthToken> {
    const authTokenId = generateUUID() as AuthTokenId;

    const authToken: AuthToken = {
      id: authTokenId,
      readerId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + AUTH_TOKEN_TIME_TO_LIVE),
    };

    const primaryKey = ['auth_tokens', authToken.id];

    await this.kv.set(primaryKey, authToken);

    return authToken;
  }
}
