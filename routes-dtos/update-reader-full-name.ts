import { z } from 'zod';
import { READER_FULL_NAME_MAX_LENGTH } from '../constants.ts';

export const UpdateReaderFullNameDTOSchema = z.object({
  fullName: z.string().max(READER_FULL_NAME_MAX_LENGTH),
});

export type UpdateReaderFullNameDTO = z.infer<typeof UpdateReaderFullNameDTOSchema>;