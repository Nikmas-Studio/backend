import { AuthTokenId } from '../models/auth/types.ts';

export function generateLoginLink(authTokenId: AuthTokenId): URL {
  return new URL(`https://nikmas.studio/login?authToken=${authTokenId}`);
}
