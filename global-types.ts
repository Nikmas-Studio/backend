export type UUID = string;
export type Email = string;

declare const __brand: unique symbol;
type Brand<B> = { [__brand]: B };

export type Branded<T, B> = T & Brand<B>;

export enum Env {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}