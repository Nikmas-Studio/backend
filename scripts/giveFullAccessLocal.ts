import { asyncLocalStorage } from '../context.ts';
import { ReaderDenoKvRepository } from '../models/reader/deno-kv-repository.ts';

await asyncLocalStorage.run(new Map(), async () => {
  asyncLocalStorage.getStore()!.set(
    'requestId',
    'request-id',
  );
  
  const readerEmail = 'maslov.n.e@gmail.com';

  const denoKv = await Deno.openKv();
  const bookRepository = new ReaderDenoKvRepository(denoKv);
  await bookRepository.setFullAccessStatus(readerEmail, true);
});
