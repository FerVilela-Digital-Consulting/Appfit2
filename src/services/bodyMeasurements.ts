import { supabase } from "@/services/supabaseClient";
import { DEFAULT_WATER_TIMEZONE, getDateKeyForTimezone } from "@/features/water/waterUtils";
import { getWeightReferenceForDate } from "@/services/bodyMetrics";
import type { Tables } from "@/services/supabase/types";

export type BodyMeasurement = Tables<"body_measurements">;

export type BodyMeasurementWeightReference = {
  weightKg: number | null;
  source: "closest_on_or_before" | "latest_available" | "profile_fallback" | null;
  measuredAt: string | null;
};

type AddBodyMeasurementInput = {
  userId: string | null;
  date: Date;
  waist_cm: number;
  neck_cm: number;
  hip_cm?: number | null;
  thigh_cm?: number | null;
  arm_cm?: number | null;
  notes?: string | null;
  isGuest?: boolean;
  timeZone?: string;
  profileHeightCm?: number | null;
  profileWeightKg?: number | null;
  biologicalSex?: "male" | "female" | null;
};

const GUEST_BODY_MEASUREMENTS_KEY = "appfit_guest_body_measurements";

const parseGuest = (): BodyMeasurement[] => {
  const raw = localStorage.getItem(GUEST_BODY_MEASUREMENTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as BodyMeasurement[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
const saveGuest = (rows: BodyMeasurement[]) => localStorage.setItem(GUEST_BODY_MEASUREMENTS_KEY, JSON.stringify(rows));

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const computeNavyBodyFat = (params: {
  heightCm: number;
  waistCm: number;
  neckCm: number;
  hipCm?: number | null;
  biologicalSex?: "male" | "female" | null;
}) => {
  const { heightCm, waistCm, neckCm, hipCm, biologicalSex } = params;
  if (heightCm <= 0 || waistCm <= 0 || neckCm <= 0) return null;

  const sex = biologicalSex || "male";
  let pct: number | null = null;

  if (sex === "female" && hipCm && hipCm > 0) {
    const denominator = 1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.221 * Math.log10(heightCm);
    if (Number.isFinite(denominator) && denominator !== 0) {
      pct = 495 / denominator - 450;
    }
  } else {
    const denominator = 1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm);
    if (Number.isFinite(denominator) && denominator !== 0) {
      pct = 495 / denominator - 450;
    }
  }

  if (!Number.isFinite(pct as number)) return null;
  return Number(clamp(Number(pct), 2, 70).toFixed(1));
};

const getProfileAnthropometrics = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("height,weight,biological_sex")
    .eq("id", userId)
    .limit(1)
    .maybeSingle();
  if (error && !error.message?.includes("biological_sex")) throw error;
  return {
    heightCm: Number(data?.height || 0) || null,
    weightKg: Number(data?.weight || 0) || null,
    biologicalSex: (data?.biological_sex as "male" | "female" | null) ?? null,
  };
};

export const addBodyMeasurement = async ({
  userId,
  date,
  waist_cm,
  neck_cm,
  hip_cm = null,
  thigh_cm = null,
  arm_cm = null,
  notes = null,
  isGuest = false,
  timeZone = DEFAULT_WATER_TIMEZONE,
  profileHeightCm = null,
  profileWeightKg = null,
  biologicalSex = null,
}: AddBodyMeasurementInput): Promise<BodyMeasurement | null> => {
  const dateKey = getDateKeyForTimezone(date, timeZone);
  const waist = Number(waist_cm);
  const neck = Number(neck_cm);
  const hip = hip_cm !== null && hip_cm !== undefined ? Number(hip_cm) : null;
  const thigh = thigh_cm !== null && thigh_cm !== undefined ? Number(thigh_cm) : null;
  const arm = arm_cm !== null && arm_cm !== undefined ? Number(arm_cm) : null;

  if (!Number.isFinite(waist) || waist <= 0 || !Number.isFinite(neck) || neck <= 0) {
    throw new Error("Waist and neck are required.");
  }

  let heightCm = profileHeightCm;
  let weightKg: number | null = null;
  let sex = biologicalSex;

  if (isGuest || userId) {
    const resolvedWeight = await getBodyMeasurementWeightReference(userId, date, {
      isGuest,
      profileWeightKg,
    });
    weightKg = weightKg ?? resolvedWeight.weightKg;
  }

  if (!isGuest && userId) {
    const profileData = await getProfileAnthropometrics(userId);
    heightCm = heightCm ?? profileData.heightCm;
    weightKg = weightKg ?? profileData.weightKg;
    sex = sex ?? profileData.biologicalSex;
  }

  const bodyFatPct =
    heightCm && weightKg
      ? computeNavyBodyFat({
          heightCm,
          waistCm: waist,
          neckCm: neck,
          hipCm: hip,
          biologicalSex: sex,
        })
      : null;
  const fatMassKg = bodyFatPct !== null && weightKg ? Number(((weightKg * bodyFatPct) / 100).toFixed(2)) : null;
  const leanMassKg = fatMassKg !== null && weightKg ? Number((weightKg - fatMassKg).toFixed(2)) : null;

  const payload = {
    date_key: dateKey,
    waist_cm: waist,
    neck_cm: neck,
    hip_cm: hip,
    thigh_cm: thigh,
    arm_cm: arm,
    body_fat_pct: bodyFatPct,
    fat_mass_kg: fatMassKg,
    lean_mass_kg: leanMassKg,
    notes: notes || null,
  };

  if (isGuest) {
    const rows = parseGuest().filter((row) => row.date_key !== dateKey);
    const next: BodyMeasurement = {
      id: crypto.randomUUID(),
      user_id: "guest",
      created_at: new Date().toISOString(),
      ...payload,
    };
    rows.push(next);
    rows.sort((a, b) => b.date_key.localeCompare(a.date_key));
    saveGuest(rows);
    return next;
  }
  if (!userId) return null;

  const { data, error } = await supabase
    .from("body_measurements")
    .upsert({ user_id: userId, ...payload }, { onConflict: "user_id,date_key" })
    .select("*")
    .single();
  if (error) throw error;
  return data as BodyMeasurement;
};

export const deleteBodyMeasurement = async (
  id: string,
  userId: string | null,
  options?: { isGuest?: boolean },
): Promise<void> => {
  const isGuest = options?.isGuest || false;

  if (isGuest) {
    const rows = parseGuest().filter((row) => row.id !== id);
    saveGuest(rows);
    return;
  }
  if (!userId) return;

  const { error } = await supabase.from("body_measurements").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
};

export const listBodyMeasurements = async (userId: string | null, options?: { isGuest?: boolean }) => {
  const isGuest = options?.isGuest || false;
  if (isGuest) {
    return parseGuest().sort((a, b) => a.date_key.localeCompare(b.date_key));
  }
  if (!userId) return [];

  const { data, error } = await supabase
    .from("body_measurements")
    .select("*")
    .eq("user_id", userId)
    .order("date_key", { ascending: true });
  if (error) throw error;
  return (data || []) as BodyMeasurement[];
};

export const getBodyMeasurementsRange = async (
  userId: string | null,
  from: Date,
  to: Date,
  options?: { isGuest?: boolean; timeZone?: string },
) => {
  const isGuest = options?.isGuest || false;
  const timeZone = options?.timeZone || DEFAULT_WATER_TIMEZONE;
  const fromKey = getDateKeyForTimezone(from, timeZone);
  const toKey = getDateKeyForTimezone(to, timeZone);

  if (isGuest) {
    return parseGuest()
      .filter((row) => row.date_key >= fromKey && row.date_key <= toKey)
      .sort((a, b) => a.date_key.localeCompare(b.date_key));
  }
  if (!userId) return [];

  const { data, error } = await supabase
    .from("body_measurements")
    .select("*")
    .eq("user_id", userId)
    .gte("date_key", fromKey)
    .lte("date_key", toKey)
    .order("date_key", { ascending: true });
  if (error) throw error;
  return (data || []) as BodyMeasurement[];
};

export const getLatestBodyMeasurement = async (userId: string | null, options?: { isGuest?: boolean }) => {
  const isGuest = options?.isGuest || false;
  if (isGuest) return parseGuest().sort((a, b) => b.date_key.localeCompare(a.date_key))[0] ?? null;
  if (!userId) return null;

  const { data, error } = await supabase
    .from("body_measurements")
    .select("*")
    .eq("user_id", userId)
    .order("date_key", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as BodyMeasurement | null) ?? null;
};

export const getBodyMeasurementWeightReference = async (
  userId: string | null,
  targetDate: Date,
  options?: { isGuest?: boolean; profileWeightKg?: number | null },
): Promise<BodyMeasurementWeightReference> => {
  const isGuest = options?.isGuest || false;
  const profileWeightKg = options?.profileWeightKg ?? null;
  const ref = await getWeightReferenceForDate(userId, targetDate, isGuest);

  if (ref.entry) {
    return {
      weightKg: Number(ref.entry.weight_kg),
      source: ref.source,
      measuredAt: ref.entry.measured_at,
    };
  }

  if (profileWeightKg !== null && profileWeightKg !== undefined && Number.isFinite(Number(profileWeightKg))) {
    return {
      weightKg: Number(profileWeightKg),
      source: "profile_fallback",
      measuredAt: null,
    };
  }

  return {
    weightKg: null,
    source: null,
    measuredAt: null,
  };
};
