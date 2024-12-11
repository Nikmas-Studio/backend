import { asyncLocalStorage } from '../context.ts';
import { ReaderDenoKvRepository } from '../models/reader/deno-kv-repository.ts';

await asyncLocalStorage.run(new Map(), async () => {
  asyncLocalStorage.getStore()!.set(
    'requestId',
    'request-id',
  );
  
  const readerEmail = 'maslov.n.e@gmail.com';

  const denoKv = await Deno.openKv("https://api.deno.com/databases/4c5ff93a-fe24-4953-8110-72adb0545326/connect");
  const bookRepository = new ReaderDenoKvRepository(denoKv);
  await bookRepository.setFullAccessStatus(readerEmail, true);
});
