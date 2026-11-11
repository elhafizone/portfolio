/**
 * Best-effort cost guard for /api/ori, held in the Node process: a sliding hour per visitor (IP)
 * and a fixed 24h window for the whole site. A restart resets it; the hard ceiling is the monthly
 * spend limit set in the Anthropic Console.
 */

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export type Verdict = 'ok' | 'ip' | 'day';

export function createLimiter({ perHour, perDay }: { perHour: number; perDay: number }) {
  const hits = new Map<string, number[]>();
  let dayStart = -Infinity;
  let dayCount = 0;

  return {
    take(ip: string, now: number): Verdict {
      if (now - dayStart >= DAY) {
        dayStart = now;
        dayCount = 0;
        hits.clear(); // also keeps the map from growing for ever
      }
      if (dayCount >= perDay) return 'day';
      const recent = (hits.get(ip) ?? []).filter((t) => now - t < HOUR);
      if (recent.length >= perHour) {
        hits.set(ip, recent);
        return 'ip';
      }
      recent.push(now);
      hits.set(ip, recent);
      dayCount++;
      return 'ok';
    },
  };
}
