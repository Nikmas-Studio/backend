import { asyncLocalStorage } from '../context.ts';
import { ReaderDenoKvRepository } from '../models/reader/deno-kv-repository.ts';

await asyncLocalStorage.run(new Map(), async () => {
  asyncLocalStorage.getStore()!.set(
    'requestId',
    'request-id',
  );

  const readerEmail = 'marketing.muraha@gmail.com';

  const denoKv = await Deno.openKv(
    'https://api.deno.com/databases/4c5ff93a-fe24-4953-8110-72adb0545326/connect',
  );
  const readerRepository = new ReaderDenoKvRepository(denoKv);
  await readerRepository.getOrCreateReader({
    email: readerEmail,
    isInvestor: false,
    hasFullAccess: true,
  });
  await readerRepository.setFullAccessStatus(readerEmail, true);
});
