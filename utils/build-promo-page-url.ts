export function buildPromoPageUrl(bookURI: string): URL {
  return new URL(`${Deno.env.get('FRONTEND_URL')}/${bookURI}`);
}