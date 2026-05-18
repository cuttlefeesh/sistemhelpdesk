import { LRUCache } from "lru-cache";

export function rateLimit({ interval, limit }: { interval: number; limit: number }) {
  const cache = new LRUCache<string, number[]>({ max: 500, ttl: interval });
  return {
    check(ip: string): boolean {
      const now = Date.now();
      const hits = (cache.get(ip) ?? []).filter((t) => t > now - interval);
      if (hits.length >= limit) {
        cache.set(ip, hits);
        return false;
      }
      cache.set(ip, [...hits, now]);
      return true;
    },
  };
}
