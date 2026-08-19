// Deterministic PRNG (mulberry32) so the seed script produces the same dataset on every run —
// makes the "critical" Section 6 distributions reproducible and easy to sanity-check.
export function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function weightedPick<T extends string>(rand: () => number, distribution: Record<T, number>): T {
  const entries = Object.entries(distribution) as [T, number][];
  const r = rand();
  let acc = 0;
  for (const [key, weight] of entries) {
    acc += weight;
    if (r <= acc) return key;
  }
  return entries[entries.length - 1][0];
}

export function pickFromList<T>(rand: () => number, list: { value: T; weight: number }[]): T {
  const total = list.reduce((s, i) => s + i.weight, 0);
  const r = rand() * total;
  let acc = 0;
  for (const item of list) {
    acc += item.weight;
    if (r <= acc) return item.value;
  }
  return list[list.length - 1].value;
}

export function randInt(rand: () => number, min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

export function randFloat(rand: () => number, min: number, max: number): number {
  return rand() * (max - min) + min;
}

export function bool(rand: () => number, probability: number): boolean {
  return rand() < probability;
}
