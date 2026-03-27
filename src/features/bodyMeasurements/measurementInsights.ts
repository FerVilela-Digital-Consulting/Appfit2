import type { BodyMeasurement } from "@/services/bodyMeasurements";

export type MeasurementRangePreset = "30d" | "90d" | "180d" | "all";

export type MeasurementMetricKey = "body_fat_pct" | "waist_cm" | "neck_cm" | "arm_cm" | "hip_cm" | "thigh_cm";

export type WaistComparison = {
  deltaCm: number | null;
  label: string;
  referenceDateKey: string | null;
};

export type MeasurementSummary = {
  latest: BodyMeasurement | null;
  previous: BodyMeasurement | null;
  weeklyReference: BodyMeasurement | null;
  recentReference: BodyMeasurement | null;
  waistComparison: WaistComparison;
};

export type MeasurementDiffRow = {
  key: "waist_cm" | "neck_cm" | "hip_cm" | "thigh_cm" | "arm_cm";
  label: string;
  from: number | null;
  to: number | null;
  delta: number | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export const sortBodyMeasurementsAsc = (rows: BodyMeasurement[]) =>
  [...rows].sort((a, b) => a.date_key.localeCompare(b.date_key));

export const getMeasurementRangeStart = (preset: MeasurementRangePreset, now = new Date()) => {
  if (preset === "all") return null;
  const days = preset === "30d" ? 30 : preset === "90d" ? 90 : 180;
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - (days - 1));
  return from;
};

export const filterMeasurementsByRangePreset = (
  rows: BodyMeasurement[],
  preset: MeasurementRangePreset,
  now = new Date(),
) => {
  const from = getMeasurementRangeStart(preset, now);
  if (!from) return sortBodyMeasurementsAsc(rows);
  const fromKey = from.toISOString().slice(0, 10);
  return sortBodyMeasurementsAsc(rows).filter((row) => row.date_key >= fromKey);
};

export const findMeasurementByDateKey = (rows: BodyMeasurement[], dateKey: string) =>
  rows.find((row) => row.date_key === dateKey) ?? null;

const metricDelta = (latest?: number | null, previous?: number | null) => {
  if (latest === null || latest === undefined || previous === null || previous === undefined) return null;
  return Number((Number(latest) - Number(previous)).toFixed(1));
};

export const deriveMeasurementSummary = (rows: BodyMeasurement[], targetDate?: Date): MeasurementSummary => {
  const asc = sortBodyMeasurementsAsc(rows);
  const latest = asc.at(-1) ?? null;
  const previous = asc.length > 1 ? asc[asc.length - 2] : null;

  if (!latest) {
    return {
      latest: null,
      previous: null,
      weeklyReference: null,
      recentReference: null,
      waistComparison: {
        deltaCm: null,
        label: "Sin referencia previa",
        referenceDateKey: null,
      },
    };
  }

  const latestDate = targetDate ?? new Date(`${latest.date_key}T12:00:00`);
  const targetWeek = new Date(latestDate);
  targetWeek.setHours(0, 0, 0, 0);
  targetWeek.setDate(targetWeek.getDate() - 7);
  const targetWeekMs = targetWeek.getTime();
  const latestMs = new Date(`${latest.date_key}T00:00:00`).getTime();

  const weeklyCandidates = asc.filter((row) => row.id !== latest.id && new Date(`${row.date_key}T00:00:00`).getTime() <= latestMs);
  const nearestWeeklyReference = weeklyCandidates
    .filter((row) => Math.abs(new Date(`${row.date_key}T00:00:00`).getTime() - targetWeekMs) <= 3 * DAY_MS)
    .sort(
      (a, b) =>
        Math.abs(new Date(`${a.date_key}T00:00:00`).getTime() - targetWeekMs) -
        Math.abs(new Date(`${b.date_key}T00:00:00`).getTime() - targetWeekMs),
    )[0] ?? null;
  const weeklyReference =
    nearestWeeklyReference ?? [...weeklyCandidates].reverse().find((row) => row.date_key <= targetWeek.toISOString().slice(0, 10)) ?? null;
  const recentReference = weeklyReference ?? previous;

  return {
    latest,
    previous,
    weeklyReference,
    recentReference,
    waistComparison: recentReference
      ? {
          deltaCm: metricDelta(latest.waist_cm, recentReference.waist_cm),
          label: weeklyReference ? "vs 7 días" : "vs registro previo",
          referenceDateKey: recentReference.date_key,
        }
      : {
          deltaCm: null,
          label: "Sin referencia previa",
          referenceDateKey: null,
        },
  };
};

export const buildMeasurementChartData = (rows: BodyMeasurement[], metric: MeasurementMetricKey) =>
  sortBodyMeasurementsAsc(rows)
    .filter((row) => row[metric] !== null && row[metric] !== undefined)
    .map((row) => ({
      date: row.date_key,
      value: Number(row[metric]),
    }));

export const buildMeasurementComparison = (
  rows: BodyMeasurement[],
  fromDateKey: string | null,
  toDateKey: string | null,
) => {
  const from = fromDateKey ? findMeasurementByDateKey(rows, fromDateKey) : null;
  const to = toDateKey ? findMeasurementByDateKey(rows, toDateKey) : null;

  const metrics: Array<MeasurementDiffRow["key"]> = ["waist_cm", "neck_cm", "hip_cm", "thigh_cm", "arm_cm"];
  const labels: Record<MeasurementDiffRow["key"], string> = {
    waist_cm: "Cintura",
    neck_cm: "Cuello",
    hip_cm: "Cadera",
    thigh_cm: "Muslo",
    arm_cm: "Brazo",
  };

  return {
    from,
    to,
    rows: metrics.map((key) => ({
      key,
      label: labels[key],
      from: from?.[key] !== null && from?.[key] !== undefined ? Number(from[key]) : null,
      to: to?.[key] !== null && to?.[key] !== undefined ? Number(to[key]) : null,
      delta:
        from?.[key] !== null &&
        from?.[key] !== undefined &&
        to?.[key] !== null &&
        to?.[key] !== undefined
          ? Number((Number(to[key]) - Number(from[key])).toFixed(1))
          : null,
    })),
  };
};

