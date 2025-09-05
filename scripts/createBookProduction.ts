import { asyncLocalStorage } from '../context.ts';
import { BookDenoKvRepository } from '../models/book/deno-kv-repository.ts';

await asyncLocalStorage.run(new Map(), async () => {
  asyncLocalStorage.getStore()!.set(
    'requestId',
    'request-id',
  );

  const denoKv = await Deno.openKv(
    'https://api.deno.com/databases/4c5ff93a-fe24-4953-8110-72adb0545326/connect',
  );
  const bookRepository = new BookDenoKvRepository(denoKv);

  await bookRepository.createBook({
    title: 'Master English with Sherlock Holmes',
    uri: 'book-master-english-with-sherlock-holmes',
    mainPrice: 27,
  });
});
