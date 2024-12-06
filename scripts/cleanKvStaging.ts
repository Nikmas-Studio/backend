const kv = await Deno.openKv("https://api.deno.com/databases/de14b4e4-b269-4b43-bd8e-d91ca4dddf84/connect");

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