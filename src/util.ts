export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export function pureEntries<T extends object>(entity: T): Entries<T> {
  return Object.entries(entity) as unknown as Entries<T>;
}
