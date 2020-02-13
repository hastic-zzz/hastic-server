// We should remove Omit definition when we'll be updating TypeScript
// It was introduced in TS v3.5.1:
// https://devblogs.microsoft.com/typescript/announcing-typescript-3-5/#the-omit-helper-type
/**
 * Construct a type with the properties of T except for those in type K.
*/
export type Omit<T, K extends string | number | symbol> = { [P in Exclude<keyof T, K>]: T[P]; }
