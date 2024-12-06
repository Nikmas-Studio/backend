export function generateBookReadUrl(bookURI: string): string {
  return `${Deno.env.get('FRONTENT_URL')}/${bookURI}/read`;
}