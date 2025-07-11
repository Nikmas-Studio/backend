export function buildPromoPageUrl(bookURI: string): URL {
  return new URL(`https://nikmas.studio/${bookURI}`);
}