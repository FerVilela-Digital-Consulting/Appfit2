import { supabase } from "@/services/supabaseClient";

export type BodyMetricEntry = {
  id: string;
  user_id: string;
  measured_at: string;
  weight_kg: number;
  notes: string | null;
  created_at: string;
};

export type GuestWeightGoal = {
  target_weight_kg: number | null;
  target_date: string | null;
  start_weight_kg: number | null;
  goal_direction: "lose" | "gain" | "maintain" | null;
};

export type WeightReference = {
  entry: BodyMetricEntry | null;
  source: "closest_on_or_before" | "latest_available" | null;
};

export type UpsertBodyMetricInput = {
  userId: string | null;
  isGuest?: boolean;
  measured_at: string;
  weight_kg: number;
  notes?: string | null;
};

export const GUEST_BODY_METRICS_STORAGE_KEY = "appfit_guest_body_metrics";
export const GUEST_WEIGHT_GOAL_STORAGE_KEY = "appfit_guest_weight_goal";

export const getGuestBodyMetrics = (): BodyMetricEntry[] => {
  const raw = localStorage.getItem(GUEST_BODY_METRICS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as BodyMetricEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

export const saveGuestBodyMetrics = (entries: BodyMetricEntry[]) => {
  localStorage.setItem(GUEST_BODY_METRICS_STORAGE_KEY, JSON.stringify(entries));
};

export const listBodyMetrics = async (userId: string | null, isGuest = false): Promise<BodyMetricEntry[]> => {
  if (!userId || isGuest) return [];

  const { data, error } = await supabase
    .from("body_metrics")
    .select("*")
    .eq("user_id", userId)
    .order("measured_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as BodyMetricEntry[];
};

export const listBodyMetricsByRange = async (
  userId: string | null,
  range: "7d" | "30d" | "90d" | "all",
  isGuest = false,
): Promise<BodyMetricEntry[]> => {
  if (!userId || isGuest) return [];

  let query = supabase
    .from("body_metrics")
    .select("*")
    .eq("user_id", userId)
    .order("measured_at", { ascending: true });

  if (range !== "all") {
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    query = query.gte("measured_at", fromDate.toISOString().slice(0, 10));
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data || []) as BodyMetricEntry[];
};

export const upsertBodyMetric = async ({
  userId,
  isGuest = false,
  measured_at,
  weight_kg,
  notes,
}: UpsertBodyMetricInput): Promise<BodyMetricEntry | null> => {
  if (!userId || isGuest) return null;

  const payload = {
    user_id: userId,
    measured_at,
    weight_kg,
    notes: notes || null,
  };

  const { data, error } = await supabase
    .from("body_metrics")
    .upsert(payload, { onConflict: "user_id,measured_at" })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as BodyMetricEntry;
};

export const deleteBodyMetric = async (id: string, userId: string | null, isGuest = false): Promise<void> => {
  if (!id || !userId || isGuest) return;

  const { error } = await supabase
    .from("body_metrics")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
};

export const getGuestWeightGoal = (): GuestWeightGoal => {
  const raw = localStorage.getItem(GUEST_WEIGHT_GOAL_STORAGE_KEY);
  if (!raw) {
    return {
      target_weight_kg: null,
      target_date: null,
      start_weight_kg: null,
      goal_direction: null,
    };
  }
  try {
    const parsed = JSON.parse(raw) as GuestWeightGoal;
    return {
      target_weight_kg: parsed.target_weight_kg ?? null,
      target_date: parsed.target_date ?? null,
      start_weight_kg: parsed.start_weight_kg ?? null,
      goal_direction: parsed.goal_direction ?? null,
    };
  } catch {
    return {
      target_weight_kg: null,
      target_date: null,
      start_weight_kg: null,
      goal_direction: null,
    };
  }
};

export const saveGuestWeightGoal = (goal: GuestWeightGoal) => {
  localStorage.setItem(GUEST_WEIGHT_GOAL_STORAGE_KEY, JSON.stringify(goal));
};

const toAsc = (entries: BodyMetricEntry[]) => [...entries].sort((a, b) => a.measured_at.localeCompare(b.measured_at));

export const resolveWeightReferenceFromEntries = (
  entries: BodyMetricEntry[],
  targetDateKey: string,
): WeightReference => {
  const sortedEntries = toAsc(entries);
  if (sortedEntries.length === 0) {
    return { entry: null, source: null };
  }

  const candidates = sortedEntries.filter((entry) => entry.measured_at <= targetDateKey);
  if (candidates.length > 0) {
    return {
      entry: candidates[candidates.length - 1],
      source: "closest_on_or_before",
    };
  }

  return {
    entry: sortedEntries[sortedEntries.length - 1],
    source: "latest_available",
  };
};

export const getAllBodyMetrics = async (userId: string | null, isGuest = false): Promise<BodyMetricEntry[]> => {
  if (isGuest) return toAsc(getGuestBodyMetrics());
  return listBodyMetricsByRange(userId, "all", isGuest);
};

export const getLatestWeight = async (userId: string | null, isGuest = false): Promise<BodyMetricEntry | null> => {
  const entries = await getAllBodyMetrics(userId, isGuest);
  return entries.length > 0 ? entries[entries.length - 1] : null;
};

export const getFirstWeight = async (userId: string | null, isGuest = false): Promise<BodyMetricEntry | null> => {
  const entries = await getAllBodyMetrics(userId, isGuest);
  return entries.length > 0 ? entries[0] : null;
};

export const getWeightClosestTo = async (
  userId: string | null,
  targetDate: Date,
  isGuest = false,
): Promise<BodyMetricEntry | null> => {
  const entries = await getAllBodyMetrics(userId, isGuest);
  if (entries.length === 0) return null;
  const key = targetDate.toISOString().slice(0, 10);
  const candidates = entries.filter((entry) => entry.measured_at <= key);
  if (candidates.length > 0) return candidates[candidates.length - 1];
  return entries[0];
};

export const getWeightReferenceForDate = async (
  userId: string | null,
  targetDate: Date,
  isGuest = false,
): Promise<WeightReference> => {
  const entries = await getAllBodyMetrics(userId, isGuest);
  const key = targetDate.toISOString().slice(0, 10);
  return resolveWeightReferenceFromEntries(entries, key);
};

export const getBodyWeightSnapshot = async (userId: string | null, isGuest = false) => {
  // Single source for dashboard/analytics cards: latest, first and weekly reference.
  const entries = await getAllBodyMetrics(userId, isGuest);
  const latest = entries.length > 0 ? entries[entries.length - 1] : null;
  const first = entries.length > 0 ? entries[0] : null;
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - 7);
  const key = targetDate.toISOString().slice(0, 10);
  const weeklyCandidates = entries.filter((entry) => entry.measured_at <= key);
  const weekRef = weeklyCandidates.length > 0 ? weeklyCandidates[weeklyCandidates.length - 1] : first;

  return {
    entries,
    latest,
    first,
    weekRef,
    weeklyDelta:
      latest && weekRef
        ? Number(Number(latest.weight_kg) - Number(weekRef.weight_kg))
        : null,
  };
};

export const getWeightTrendAnalysis = async (userId: string | null, isGuest = false) => {
  const snapshot = await getBodyWeightSnapshot(userId, isGuest);
  const entries = snapshot.entries;
  const latest = snapshot.latest ? Number(snapshot.latest.weight_kg) : null;

  const last7 = entries.slice(Math.max(0, entries.length - 7));
  const prev7 = entries.slice(Math.max(0, entries.length - 14), Math.max(0, entries.length - 7));
  const movingAvg7 =
    last7.length > 0 ? Number((last7.reduce((sum, row) => sum + Number(row.weight_kg), 0) / last7.length).toFixed(2)) : null;
  const prevMovingAvg7 =
    prev7.length > 0 ? Number((prev7.reduce((sum, row) => sum + Number(row.weight_kg), 0) / prev7.length).toFixed(2)) : null;
  const weeklyChange = snapshot.weeklyDelta;

  let trend: "up" | "down" | "stable" = "stable";
  if (weeklyChange !== null && Math.abs(weeklyChange) >= 0.2) {
    trend = weeklyChange > 0 ? "up" : "down";
  }

  return {
    latest,
    weeklyChange,
    movingAvg7,
    prevMovingAvg7,
    trend,
  };
};
