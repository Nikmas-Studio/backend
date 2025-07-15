import { asyncLocalStorage } from '../context.ts';
import { ReaderDenoKvRepository } from '../models/reader/deno-kv-repository.ts';

await asyncLocalStorage.run(new Map(), async () => {
  asyncLocalStorage.getStore()!.set(
    'requestId',
    'request-id',
  );
  
  const readerEmail = 'maslov.n.e@gmail.com';

  const denoKv = await Deno.openKv("https://api.deno.com/databases/de14b4e4-b269-4b43-bd8e-d91ca4dddf84/connect");
  const readerRepository = new ReaderDenoKvRepository(denoKv);
  await readerRepository.getOrCreateReader({
    email: readerEmail,
    isInvestor: false,
    hasFullAccess: true,
  });
  await readerRepository.setFullAccessStatus(readerEmail, true);
});
