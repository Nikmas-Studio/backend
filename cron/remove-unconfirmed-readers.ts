import { UNCONFIRMED_READER_TTL } from '../constants.ts';
import { ReaderRepository } from '../models/reader/repository-interface.ts';

export async function removeUnconfirmedReaders(
  readerRepository: ReaderRepository,
): Promise<void> {
  const allReaders = await readerRepository.getAllReaders();
  for (const reader of allReaders) {
    if (!reader.emailConfirmed) {
      const diffInMs = new Date().getTime() - reader.createdAt.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
      if (diffInDays >= UNCONFIRMED_READER_TTL) {
        await readerRepository.removeReader(reader.id);
        console.log(
          `CRON: Removed unconfirmed reader: ${
            JSON.stringify(reader)
          }. Reader was created on ${reader.createdAt}: ${diffInDays} days ago.`,
        );
      }
    }
  }
}
