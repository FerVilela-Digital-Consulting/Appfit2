import { supabase } from "@/services/supabaseClient";
import {
  aggregateDailyTotals,
  averageMl,
  countDaysMeetingGoal,
  DEFAULT_WATER_GOAL_ML,
  DEFAULT_WATER_PRESETS_ML,
  DEFAULT_WATER_TIMEZONE,
  getDateKeyForTimezone,
  normalizeWaterPresets,
} from "@/features/water/waterUtils";

export type WaterLog = {
  id: string;
  user_id: string;
  consumed_ml: number;
  logged_at: string;
  date_key: string;
  created_at: string;
};

type WaterGoalRecord = {
  water_goal_ml: number;
  water_quick_options_ml: number[];
};

type AddWaterInput = {
  userId: string | null;
  consumed_ml: number;
  date?: Date;
  timeZone?: string;
  isGuest?: boolean;
};

const GUEST_WATER_LOGS_KEY = "appfit_guest_water_logs";
const GUEST_WATER_GOAL_KEY = "appfit_guest_water_goal";
const GUEST_WATER_PRESETS_KEY = "appfit_guest_water_presets";

const getGuestLogs = () => {
  const raw = localStorage.getItem(GUEST_WATER_LOGS_KEY);
  if (!raw) return [] as WaterLog[];
  try {
    const parsed = JSON.parse(raw) as WaterLog[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveGuestLogs = (logs: WaterLog[]) => {
  localStorage.setItem(GUEST_WATER_LOGS_KEY, JSON.stringify(logs));
};

const getGuestGoal = () => Number(localStorage.getItem(GUEST_WATER_GOAL_KEY) || DEFAULT_WATER_GOAL_ML);
const saveGuestGoal = (ml: number) => localStorage.setItem(GUEST_WATER_GOAL_KEY, String(ml));

const getGuestPresets = () => {
  const raw = localStorage.getItem(GUEST_WATER_PRESETS_KEY);
  if (!raw) return DEFAULT_WATER_PRESETS_ML;
  try {
    return normalizeWaterPresets(JSON.parse(raw) as number[]);
  } catch {
    return DEFAULT_WATER_PRESETS_ML;
  }
};
const saveGuestPresets = (options: number[]) =>
  localStorage.setItem(GUEST_WATER_PRESETS_KEY, JSON.stringify(normalizeWaterPresets(options)));

export const addWaterIntake = async ({
  userId,
  consumed_ml,
  date = new Date(),
  timeZone = DEFAULT_WATER_TIMEZONE,
  isGuest = false,
}: AddWaterInput): Promise<WaterLog | null> => {
  const ml = Math.round(Number(consumed_ml));
  if (!Number.isFinite(ml) || ml <= 0) throw new Error("Water intake must be greater than 0.");
  if (ml > 10000) throw new Error("Water intake is too large.");

  const dateKey = getDateKeyForTimezone(date, timeZone);
  const loggedAt = date.toISOString();

  if (isGuest) {
    const next: WaterLog = {
      id: crypto.randomUUID(),
      user_id: "guest",
      consumed_ml: ml,
      logged_at: loggedAt,
      date_key: dateKey,
      created_at: new Date().toISOString(),
    };
    const logs = [next, ...getGuestLogs()];
    saveGuestLogs(logs);
    return next;
  }

  if (!userId) return null;

  const { data, error } = await supabase
    .from("water_intake_logs")
    .insert({
      user_id: userId,
      consumed_ml: ml,
      logged_at: loggedAt,
      date_key: dateKey,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as WaterLog;
};

export const getWaterDayTotal = async (
  userId: string | null,
  date: Date,
  options?: { timeZone?: string; isGuest?: boolean },
): Promise<number> => {
  const timeZone = options?.timeZone || DEFAULT_WATER_TIMEZONE;
  const isGuest = options?.isGuest || false;
  const dateKey = getDateKeyForTimezone(date, timeZone);

  if (isGuest) {
    return getGuestLogs()
      .filter((log) => log.date_key === dateKey)
      .reduce((acc, log) => acc + Number(log.consumed_ml || 0), 0);
  }

  if (!userId) return 0;

  const { data, error } = await supabase
    .from("water_intake_logs")
    .select("consumed_ml")
    .eq("user_id", userId)
    .eq("date_key", dateKey);

  if (error) throw error;
  return (data || []).reduce((acc, row: any) => acc + Number(row.consumed_ml || 0), 0);
};

export const getWaterRangeTotals = async (
  userId: string | null,
  from: Date,
  to: Date,
  options?: { isGuest?: boolean },
): Promise<Array<{ date_key: string; total_ml: number }>> => {
  const fromKey = from.toISOString().slice(0, 10);
  const toKey = to.toISOString().slice(0, 10);
  const isGuest = options?.isGuest || false;

  if (isGuest) {
    const logs = getGuestLogs().filter((log) => log.date_key >= fromKey && log.date_key <= toKey);
    return aggregateDailyTotals(logs, from, to);
  }

  if (!userId) return aggregateDailyTotals([], from, to);

  const { data, error } = await supabase
    .from("water_intake_logs")
    .select("date_key,consumed_ml")
    .eq("user_id", userId)
    .gte("date_key", fromKey)
    .lte("date_key", toKey)
    .order("date_key", { ascending: true });

  if (error) throw error;
  return aggregateDailyTotals((data || []) as Array<{ date_key: string; consumed_ml: number }>, from, to);
};

export const getWaterLogsByDate = async (
  userId: string | null,
  date: Date,
  options?: { timeZone?: string; isGuest?: boolean },
) => {
  const timeZone = options?.timeZone || DEFAULT_WATER_TIMEZONE;
  const isGuest = options?.isGuest || false;
  const dateKey = getDateKeyForTimezone(date, timeZone);

  if (isGuest) {
    return getGuestLogs()
      .filter((log) => log.date_key === dateKey)
      .sort((a, b) => b.logged_at.localeCompare(a.logged_at));
  }
  if (!userId) return [];

  const { data, error } = await supabase
    .from("water_intake_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("date_key", dateKey)
    .order("logged_at", { ascending: false });

  if (error) throw error;
  return (data || []) as WaterLog[];
};

export const deleteWaterLog = async (id: string, userId: string | null, options?: { isGuest?: boolean }) => {
  const isGuest = options?.isGuest || false;
  if (!id) return;

  if (isGuest) {
    const logs = getGuestLogs().filter((log) => log.id !== id);
    saveGuestLogs(logs);
    return;
  }

  if (!userId) return;

  const { error } = await supabase.from("water_intake_logs").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
};

export const getWaterGoal = async (userId: string | null, options?: { isGuest?: boolean }): Promise<WaterGoalRecord> => {
  const isGuest = options?.isGuest || false;
  if (isGuest) {
    return {
      water_goal_ml: getGuestGoal(),
      water_quick_options_ml: getGuestPresets(),
    };
  }

  if (!userId) {
    return {
      water_goal_ml: DEFAULT_WATER_GOAL_ML,
      water_quick_options_ml: DEFAULT_WATER_PRESETS_ML,
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("water_goal_ml,water_quick_options_ml")
    .eq("id", userId)
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return {
    water_goal_ml: Number(data?.water_goal_ml ?? DEFAULT_WATER_GOAL_ML),
    water_quick_options_ml: normalizeWaterPresets(data?.water_quick_options_ml as number[] | null | undefined),
  };
};

export const updateWaterGoal = async (
  userId: string | null,
  ml: number,
  options?: { isGuest?: boolean },
): Promise<number> => {
  const goal = Math.round(Number(ml));
  if (!Number.isFinite(goal) || goal <= 0) throw new Error("Water goal must be greater than 0.");
  if (goal > 20000) throw new Error("Water goal is too large.");

  const isGuest = options?.isGuest || false;
  if (isGuest) {
    saveGuestGoal(goal);
    return goal;
  }
  if (!userId) return goal;

  const { error } = await supabase.from("profiles").update({ water_goal_ml: goal }).eq("id", userId);
  if (error) throw error;
  return goal;
};

export const updateWaterQuickOptions = async (
  userId: string | null,
  options: number[],
  params?: { isGuest?: boolean },
): Promise<number[]> => {
  const normalized = normalizeWaterPresets(options);
  const isGuest = params?.isGuest || false;

  if (isGuest) {
    saveGuestPresets(normalized);
    return normalized;
  }
  if (!userId) return normalized;

  const { error } = await supabase
    .from("profiles")
    .update({ water_quick_options_ml: normalized })
    .eq("id", userId);
  if (error) throw error;
  return normalized;
};

export const getWaterWeeklySummary = async (
  userId: string | null,
  referenceDate = new Date(),
  options?: { isGuest?: boolean },
) => {
  const to = new Date(referenceDate);
  to.setHours(0, 0, 0, 0);
  const from = new Date(to);
  from.setDate(from.getDate() - 6);

  const [totals, goal] = await Promise.all([
    getWaterRangeTotals(userId, from, to, { isGuest: options?.isGuest }),
    getWaterGoal(userId, { isGuest: options?.isGuest }),
  ]);

  return {
    days_total: totals.length,
    days_met: countDaysMeetingGoal(totals, goal.water_goal_ml),
    average_ml: averageMl(totals),
  };
};
