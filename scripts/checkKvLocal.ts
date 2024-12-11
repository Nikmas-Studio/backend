const kv = await Deno.openKv();

console.log('Checking local KV store...');
async function checkKv(kv: Deno.Kv): Promise<void> {
  for await (const entry of kv.list({ prefix: [] })) {
    console.log(JSON.stringify(entry, null, 2));
  }
}
console.log('Local KV store checked.');

await checkKv(kv);

kv.close();
