export type Translation = string;

export interface TranslateDTO {
  targetLanguage: string;
  context: string;
  fragment: string;
}

export interface RefineTranslationDTO {
  targetLanguage: string;
  context: string;
  fragment: string;
  translation: string;
}
