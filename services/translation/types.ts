export type Translation = string;

export interface TranslateDTO {
  targetLanguage: string;
  context: string;
  fragment: string;
}
