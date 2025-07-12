import { asyncLocalStorage } from '../context.ts';
import { BookDenoKvRepository } from '../models/book/deno-kv-repository.ts';

await asyncLocalStorage.run(new Map(), async () => {
  asyncLocalStorage.getStore()!.set(
    'requestId',
    'request-id',
  );

  const denoKv = await Deno.openKv(
    'https://api.deno.com/databases/de14b4e4-b269-4b43-bd8e-d91ca4dddf84/connect',
  );
  const bookRepository = new BookDenoKvRepository(denoKv);
  await bookRepository.createBook({
    title: 'Master Git & GitHub: From Everyday Tasks to Deep Waters',
    uri: 'book-master-git-and-github',
    price: 23,
  });
  
  await bookRepository.createBook({
    title: 'Master English with Sherlock Holmes',
    uri: 'book-master-english-with-sherlock-holmes',
    price: 23,
  });
});
