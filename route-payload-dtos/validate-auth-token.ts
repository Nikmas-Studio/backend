import { z } from 'zod';

export const ValidateAuthTokenDTOSchema = z.object({
  authToken: z.string().uuid(),
});

export type ValidateAuthTokenDTO = z.infer<typeof ValidateAuthTokenDTOSchema>;
