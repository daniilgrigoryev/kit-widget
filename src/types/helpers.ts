// Данные типы нужны для типизации в библиотеках и хелперах. Мы не сможем просто так от них отказаться
type AnyKey = keyof AnyForHelpers;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyForHelpers = any;

export type IndexableKeys<T> = {
  [K in keyof T]: T[K] extends keyof AnyKey ? K : never;
}[keyof T];

export type IsValidKey<T> = Extract<T, keyof AnyKey>;
