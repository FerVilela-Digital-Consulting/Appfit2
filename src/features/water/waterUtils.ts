export const DEFAULT_WATER_GOAL_ML = 2000;
export const DEFAULT_WATER_PRESETS_ML = [250, 500, 1000, 2000];
export const DEFAULT_WATER_TIMEZONE = "America/Lima";

export const getDateKeyForTimezone = (date: Date, timeZone = DEFAULT_WATER_TIMEZONE): string => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  if (!year || !month || !day) {
    return date.toISOString().slice(0, 10);
  }

  return `${year}-${month}-${day}`;
};

export const calculateWaterProgress = (consumedMl: number, goalMl: number) => {
  if (goalMl <= 0) return 0;
  return Math.max(0, Math.min(100, (consumedMl / goalMl) * 100));
};

export const normalizeWaterPresets = (options: number[] | null | undefined): number[] => {
  const base = options && options.length > 0 ? options : DEFAULT_WATER_PRESETS_ML;
  const normalized = base
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v) && v > 0 && v <= 10000)
    .map((v) => Math.round(v));
  return Array.from(new Set(normalized)).sort((a, b) => a - b);
};

export const createDateKeyRange = (from: Date, to: Date): string[] => {
  const out: string[] = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    out.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
};

export const aggregateDailyTotals = (
  logs: Array<{ date_key: string; consumed_ml: number }>,
  from: Date,
  to: Date,
): Array<{ date_key: string; total_ml: number }> => {
  const map = new Map<string, number>();
  logs.forEach((log) => {
    map.set(log.date_key, (map.get(log.date_key) ?? 0) + Number(log.consumed_ml || 0));
  });

  return createDateKeyRange(from, to).map((key) => ({
    date_key: key,
    total_ml: map.get(key) ?? 0,
  }));
};

export const averageMl = (totals: Array<{ total_ml: number }>) => {
  if (totals.length === 0) return 0;
  return Math.round(totals.reduce((acc, item) => acc + item.total_ml, 0) / totals.length);
};

export const countDaysMeetingGoal = (totals: Array<{ total_ml: number }>, goalMl: number) => {
  if (goalMl <= 0) return 0;
  return totals.filter((item) => item.total_ml >= goalMl).length;
};
