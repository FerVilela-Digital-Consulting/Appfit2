export type QueryPerformanceSample = {
  queryKey: string;
  durationMs: number;
  route: string;
  startedAt: number;
  finishedAt: number;
};

export type QueryPerformanceSummary = {
  queryKey: string;
  count: number;
  avgMs: number;
  p50Ms: number;
  p95Ms: number;
  maxMs: number;
};

const STORAGE_KEY = "appfit.query-performance.samples";
const MAX_SAMPLES = 250;

const toSafeNumber = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const parseSamples = (raw: string | null): QueryPerformanceSample[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as QueryPerformanceSample[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.queryKey === "string")
      .map((item) => ({
        queryKey: item.queryKey,
        durationMs: toSafeNumber(item.durationMs, 0),
        route: typeof item.route === "string" ? item.route : "/unknown",
        startedAt: toSafeNumber(item.startedAt, 0),
        finishedAt: toSafeNumber(item.finishedAt, 0),
      }));
  } catch {
    return [];
  }
};

export const getQueryPerformanceSamples = (): QueryPerformanceSample[] => {
  if (typeof window === "undefined") return [];
  return parseSamples(window.sessionStorage.getItem(STORAGE_KEY));
};

export const clearQueryPerformanceSamples = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
};

export const appendQueryPerformanceSample = (sample: QueryPerformanceSample) => {
  if (typeof window === "undefined") return;
  const current = getQueryPerformanceSamples();
  const next = [...current, sample].slice(-MAX_SAMPLES);
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};

const percentile = (sorted: number[], p: number): number => {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[index];
};

export const summarizeQueryPerformance = (samples: QueryPerformanceSample[]): QueryPerformanceSummary[] => {
  const byKey = new Map<string, number[]>();
  samples.forEach((sample) => {
    const list = byKey.get(sample.queryKey) ?? [];
    list.push(sample.durationMs);
    byKey.set(sample.queryKey, list);
  });

  return Array.from(byKey.entries())
    .map(([queryKey, durations]) => {
      const sorted = [...durations].sort((a, b) => a - b);
      const total = sorted.reduce((sum, value) => sum + value, 0);
      return {
        queryKey,
        count: sorted.length,
        avgMs: Math.round(total / Math.max(sorted.length, 1)),
        p50Ms: Math.round(percentile(sorted, 50)),
        p95Ms: Math.round(percentile(sorted, 95)),
        maxMs: Math.round(sorted[sorted.length - 1] ?? 0),
      };
    })
    .sort((a, b) => b.p95Ms - a.p95Ms);
};

