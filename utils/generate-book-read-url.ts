export function generateBookReadUrl(bookURI: string): string {
  return `${Deno.env.get('FRONTEND_URL')}/${bookURI}/read`;
}