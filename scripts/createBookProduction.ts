import { asyncLocalStorage } from '../context.ts';
import { BookDenoKvRepository } from '../models/book/deno-kv-repository.ts';

await asyncLocalStorage.run(new Map(), async () => {
  asyncLocalStorage.getStore()!.set(
    'requestId',
    'request-id',
  );

  const denoKv = await Deno.openKv("https://api.deno.com/databases/4c5ff93a-fe24-4953-8110-72adb0545326/connect");
  const bookRepository = new BookDenoKvRepository(denoKv);
  await bookRepository.createBook({
    title: 'Master Git & GitHub: From Everyday Tasks to Deep Waters',
    uri: 'book-master-git-and-github',
    mainPrice: 23,
  });
});
