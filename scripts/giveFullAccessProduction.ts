import { asyncLocalStorage } from '../context.ts';
import { ReaderDenoKvRepository } from '../models/reader/deno-kv-repository.ts';

await asyncLocalStorage.run(new Map(), async () => {
  asyncLocalStorage.getStore()!.set(
    'requestId',
    'request-id',
  );

  const readerEmail = 'a@muraha.eu';

  const denoKv = await Deno.openKv(
    'https://api.deno.com/databases/4c5ff93a-fe24-4953-8110-72adb0545326/connect',
  );
  const bookRepository = new ReaderDenoKvRepository(denoKv);
  const readerRepository = new ReaderDenoKvRepository(denoKv);
  await readerRepository.getOrCreateReader({
    email: readerEmail,
    isInvestor: false,
    hasFullAccess: true,
  });
  await bookRepository.setFullAccessStatus(readerEmail, true);
});
