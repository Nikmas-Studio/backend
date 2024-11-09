const kv = await Deno.openKv();

console.log('Cleaning KV store...');

async function cleanKv(): Promise<void> {
  const allEntries = await Array.fromAsync(kv.list({ prefix: [] }));
  for (const entry of allEntries) {
    await kv.delete(entry.key);
  }
}

console.log('KV store cleaned.');

await cleanKv();

kv.close();
