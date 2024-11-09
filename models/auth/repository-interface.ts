import { ReaderId } from '../reader/types.ts';
import { AuthToken } from './types.ts';

export interface AuthRepository {
  createAuthToken(readerId: ReaderId): Promise<AuthToken>;
}
