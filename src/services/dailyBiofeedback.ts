import { supabase } from "@/services/supabaseClient";
import { DEFAULT_WATER_TIMEZONE, getDateKeyForTimezone } from "@/features/water/waterUtils";

export type DailyBiofeedback = {
  id: string;
  user_id: string;
  date_key: string;
  sleep_quality: number;
  hunger_level: number;
  daily_energy: number;
  training_energy: number;
  perceived_stress: number;
  libido: number;
  digestion: number;
  notes: string | null;
  created_at: string;
};

type UpsertDailyBiofeedbackInput = {
  userId: string | null;
  date: Date;
  sleep_quality: number;
  hunger_level: number;
  daily_energy: number;
  training_energy: number;
  perceived_stress: number;
  libido: number;
  digestion: number;
  notes?: string | null;
  isGuest?: boolean;
  timeZone?: string;
};

const GUEST_BIOFEEDBACK_KEY = "appfit_guest_daily_biofeedback";

const parseGuest = (): DailyBiofeedback[] => {
  const raw = localStorage.getItem(GUEST_BIOFEEDBACK_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as DailyBiofeedback[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveGuest = (rows: DailyBiofeedback[]) => localStorage.setItem(GUEST_BIOFEEDBACK_KEY, JSON.stringify(rows));

const validateScale = (value: number, label: string) => {
  if (!Number.isFinite(value) || value < 1 || value > 10) {
    throw new Error(`${label} must be between 1 and 10.`);
  }
};

export const upsertDailyBiofeedback = async ({
  userId,
  date,
  sleep_quality,
  hunger_level,
  daily_energy,
  training_energy,
  perceived_stress,
  libido,
  digestion,
  notes = null,
  isGuest = false,
  timeZone = DEFAULT_WATER_TIMEZONE,
}: UpsertDailyBiofeedbackInput): Promise<DailyBiofeedback | null> => {
  validateScale(sleep_quality, "Sleep quality");
  validateScale(hunger_level, "Hunger");
  validateScale(daily_energy, "Daily energy");
  validateScale(training_energy, "Training energy");
  validateScale(perceived_stress, "Stress");
  validateScale(libido, "Libido");
  validateScale(digestion, "Digestion");

  const dateKey = getDateKeyForTimezone(date, timeZone);
  const payload = {
    date_key: dateKey,
    sleep_quality: Math.round(sleep_quality),
    hunger_level: Math.round(hunger_level),
    daily_energy: Math.round(daily_energy),
    training_energy: Math.round(training_energy),
    perceived_stress: Math.round(perceived_stress),
    libido: Math.round(libido),
    digestion: Math.round(digestion),
    notes: notes || null,
  };

  if (isGuest) {
    const rows = parseGuest().filter((row) => row.date_key !== dateKey);
    const next: DailyBiofeedback = {
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
    .from("daily_biofeedback")
    .upsert({ user_id: userId, ...payload }, { onConflict: "user_id,date_key" })
    .select("*")
    .single();
  if (error) throw error;
  return data as DailyBiofeedback;
};

export const getDailyBiofeedback = async (
  userId: string | null,
  date: Date,
  options?: { isGuest?: boolean; timeZone?: string },
): Promise<DailyBiofeedback | null> => {
  const isGuest = options?.isGuest || false;
  const timeZone = options?.timeZone || DEFAULT_WATER_TIMEZONE;
  const dateKey = getDateKeyForTimezone(date, timeZone);

  if (isGuest) {
    return parseGuest().find((row) => row.date_key === dateKey) ?? null;
  }
  if (!userId) return null;

  const { data, error } = await supabase
    .from("daily_biofeedback")
    .select("*")
    .eq("user_id", userId)
    .eq("date_key", dateKey)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as DailyBiofeedback | null) ?? null;
};

export const getBiofeedbackRange = async (
  userId: string | null,
  from: Date,
  to: Date,
  options?: { isGuest?: boolean; timeZone?: string },
): Promise<DailyBiofeedback[]> => {
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
    .from("daily_biofeedback")
    .select("*")
    .eq("user_id", userId)
    .gte("date_key", fromKey)
    .lte("date_key", toKey)
    .order("date_key", { ascending: true });
  if (error) throw error;
  return (data || []) as DailyBiofeedback[];
};

export const getBiofeedbackWeeklyAverages = async (
  userId: string | null,
  referenceDate = new Date(),
  options?: { isGuest?: boolean; timeZone?: string },
) => {
  const to = new Date(referenceDate);
  to.setHours(0, 0, 0, 0);
  const from = new Date(to);
  from.setDate(from.getDate() - 6);

  const rows = await getBiofeedbackRange(userId, from, to, options);
  const count = rows.length || 1;
  const avg = (selector: (row: DailyBiofeedback) => number) =>
    Number((rows.reduce((sum, row) => sum + selector(row), 0) / count).toFixed(1));

  return {
    days_logged: rows.length,
    avg_sleep_quality: avg((r) => r.sleep_quality),
    avg_energy: avg((r) => r.daily_energy),
    avg_stress: avg((r) => r.perceived_stress),
    avg_training_energy: avg((r) => r.training_energy),
  };
};

export const listRecentBiofeedback = async (
  userId: string | null,
  limit = 3,
  options?: { isGuest?: boolean },
) => {
  const isGuest = options?.isGuest || false;
  if (isGuest) return parseGuest().sort((a, b) => b.date_key.localeCompare(a.date_key)).slice(0, limit);
  if (!userId) return [];

  const { data, error } = await supabase
    .from("daily_biofeedback")
    .select("*")
    .eq("user_id", userId)
    .order("date_key", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as DailyBiofeedback[];
};

