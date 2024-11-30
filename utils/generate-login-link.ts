import { AuthTokenId } from '../models/auth/types.ts';

export function generateLoginLink(authTokenId: AuthTokenId): URL {
  return new URL(`${Deno.env.get('FRONTENT_URL')}/login?authToken=${authTokenId}`);
}
