// Client-side in-memory cache. Lives per browser tab; cleared on logout.
const store = new Map<string, unknown[]>();

export function getCache<T>(key: string): T[] | undefined {
  return store.get(key) as T[] | undefined;
}

export function setCache<T>(key: string, data: T[]): void {
  store.set(key, data as unknown[]);
}

export function invalidateCache(key: string): void {
  store.delete(key);
}

export function clearAllCache(): void {
  store.clear();
}
