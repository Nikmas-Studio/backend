export function normalizeTranslationPiece(text: string): string {
  return text.replaceAll(/[\n\r]/g, ' ').trim().replace(/ {2,}/g, ' ')
    .replace(/”“/g, '” “').replace(/\u00A0/g, ' ').replace(/\.“/g, '. “')
    .replace(/”(\S)/g, '” $1').replace(/\.([a-zA-Z])/g, '. $1').replace(
      /\u2060/g,
      '',
    );
}
