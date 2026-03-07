import { DEFAULT_WATER_TIMEZONE, createDateKeyRange, getDateKeyForTimezone } from "@/features/water/waterUtils";
import { supabase } from "@/services/supabaseClient";

export type NutritionMealType = "breakfast" | "lunch" | "dinner" | "snack";

export type NutritionEntry = {
  id: string;
  user_id: string;
  date_key: string;
  meal_type: NutritionMealType;
  food_name: string;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number | null;
  sugar_g: number | null;
  notes: string | null;
  created_at: string;
};

export type FavoriteFood = {
  id: string;
  user_id: string;
  name: string;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number | null;
  created_at: string;
};

export type NutritionGoals = {
  calorie_goal: number;
  protein_goal_g: number;
  carb_goal_g: number;
  fat_goal_g: number;
};

export type FoodDatabaseItem = {
  id: string;
  food_name: string;
  category: string;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number | null;
  sugar_g: number | null;
  source: string;
  created_at: string;
};

export type NutritionMacroTotals = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
};

const DEFAULT_NUTRITION_GOALS: NutritionGoals = {
  calorie_goal: 2000,
  protein_goal_g: 150,
  carb_goal_g: 250,
  fat_goal_g: 70,
};

const GUEST_NUTRITION_ENTRIES_KEY = "appfit_guest_nutrition_entries";
const GUEST_NUTRITION_FAVORITES_KEY = "appfit_guest_nutrition_favorites";
const GUEST_NUTRITION_GOALS_KEY = "appfit_guest_nutrition_goals";

const assertNonNegative = (value: number, field: string) => {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a non-negative number.`);
  }
};

const parseGuestEntries = (): NutritionEntry[] => {
  const raw = localStorage.getItem(GUEST_NUTRITION_ENTRIES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as NutritionEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveGuestEntries = (rows: NutritionEntry[]) => localStorage.setItem(GUEST_NUTRITION_ENTRIES_KEY, JSON.stringify(rows));

const parseGuestFavorites = (): FavoriteFood[] => {
  const raw = localStorage.getItem(GUEST_NUTRITION_FAVORITES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as FavoriteFood[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveGuestFavorites = (rows: FavoriteFood[]) =>
  localStorage.setItem(GUEST_NUTRITION_FAVORITES_KEY, JSON.stringify(rows));

const getGuestGoals = (): NutritionGoals => {
  const raw = localStorage.getItem(GUEST_NUTRITION_GOALS_KEY);
  if (!raw) return DEFAULT_NUTRITION_GOALS;
  try {
    const parsed = JSON.parse(raw) as Partial<NutritionGoals>;
    return {
      calorie_goal: Number(parsed.calorie_goal ?? DEFAULT_NUTRITION_GOALS.calorie_goal),
      protein_goal_g: Number(parsed.protein_goal_g ?? DEFAULT_NUTRITION_GOALS.protein_goal_g),
      carb_goal_g: Number(parsed.carb_goal_g ?? DEFAULT_NUTRITION_GOALS.carb_goal_g),
      fat_goal_g: Number(parsed.fat_goal_g ?? DEFAULT_NUTRITION_GOALS.fat_goal_g),
    };
  } catch {
    return DEFAULT_NUTRITION_GOALS;
  }
};

const saveGuestGoals = (goals: NutritionGoals) => localStorage.setItem(GUEST_NUTRITION_GOALS_KEY, JSON.stringify(goals));

const emptyTotals = (): NutritionMacroTotals => ({
  calories: 0,
  protein_g: 0,
  carbs_g: 0,
  fat_g: 0,
  fiber_g: 0,
  sugar_g: 0,
});

const aggregateTotals = (entries: NutritionEntry[]): NutritionMacroTotals =>
  entries.reduce(
    (acc, row) => ({
      calories: acc.calories + Number(row.calories || 0),
      protein_g: acc.protein_g + Number(row.protein_g || 0),
      carbs_g: acc.carbs_g + Number(row.carbs_g || 0),
      fat_g: acc.fat_g + Number(row.fat_g || 0),
      fiber_g: acc.fiber_g + Number(row.fiber_g || 0),
      sugar_g: acc.sugar_g + Number(row.sugar_g || 0),
    }),
    emptyTotals(),
  );

const roundTotals = (totals: NutritionMacroTotals): NutritionMacroTotals => ({
  calories: Math.round(totals.calories),
  protein_g: Number(totals.protein_g.toFixed(1)),
  carbs_g: Number(totals.carbs_g.toFixed(1)),
  fat_g: Number(totals.fat_g.toFixed(1)),
  fiber_g: Number(totals.fiber_g.toFixed(1)),
  sugar_g: Number(totals.sugar_g.toFixed(1)),
});

export const addNutritionEntry = async (params: {
  userId: string | null;
  date: Date;
  meal_type: NutritionMealType;
  food_name: string;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number | null;
  sugar_g?: number | null;
  notes?: string | null;
  isGuest?: boolean;
  timeZone?: string;
}): Promise<NutritionEntry | null> => {
  const {
    userId,
    date,
    meal_type,
    food_name,
    serving_size,
    serving_unit,
    calories,
    protein_g,
    carbs_g,
    fat_g,
    fiber_g = null,
    sugar_g = null,
    notes = null,
    isGuest = false,
    timeZone = DEFAULT_WATER_TIMEZONE,
  } = params;

  const name = food_name.trim();
  if (!name) throw new Error("Food name is required.");

  assertNonNegative(Number(serving_size), "Serving size");
  assertNonNegative(Number(calories), "Calories");
  assertNonNegative(Number(protein_g), "Protein");
  assertNonNegative(Number(carbs_g), "Carbs");
  assertNonNegative(Number(fat_g), "Fat");
  if (fiber_g !== null) assertNonNegative(Number(fiber_g), "Fiber");
  if (sugar_g !== null) assertNonNegative(Number(sugar_g), "Sugar");

  const payload = {
    date_key: getDateKeyForTimezone(date, timeZone),
    meal_type,
    food_name: name,
    serving_size: Number(serving_size),
    serving_unit: serving_unit.trim() || "g",
    calories: Number(calories),
    protein_g: Number(protein_g),
    carbs_g: Number(carbs_g),
    fat_g: Number(fat_g),
    fiber_g: fiber_g === null ? null : Number(fiber_g),
    sugar_g: sugar_g === null ? null : Number(sugar_g),
    notes: notes?.trim() || null,
  };

  if (isGuest) {
    const entry: NutritionEntry = {
      id: crypto.randomUUID(),
      user_id: "guest",
      created_at: new Date().toISOString(),
      ...payload,
    };
    const rows = [entry, ...parseGuestEntries()];
    saveGuestEntries(rows);
    return entry;
  }
  if (!userId) return null;

  const { data, error } = await supabase
    .from("nutrition_entries")
    .insert({ user_id: userId, ...payload })
    .select("*")
    .single();
  if (error) throw error;
  return data as NutritionEntry;
};

export const updateNutritionEntry = async (
  id: string,
  updates: Partial<Omit<NutritionEntry, "id" | "user_id" | "created_at" | "date_key">>,
  userId: string | null,
  options?: { isGuest?: boolean },
): Promise<NutritionEntry | null> => {
  const isGuest = options?.isGuest || false;
  if (!id) return null;

  if (updates.food_name !== undefined && !updates.food_name.trim()) {
    throw new Error("Food name is required.");
  }
  if (updates.serving_size !== undefined) assertNonNegative(Number(updates.serving_size), "Serving size");
  if (updates.calories !== undefined) assertNonNegative(Number(updates.calories), "Calories");
  if (updates.protein_g !== undefined) assertNonNegative(Number(updates.protein_g), "Protein");
  if (updates.carbs_g !== undefined) assertNonNegative(Number(updates.carbs_g), "Carbs");
  if (updates.fat_g !== undefined) assertNonNegative(Number(updates.fat_g), "Fat");
  if (updates.fiber_g !== undefined && updates.fiber_g !== null) assertNonNegative(Number(updates.fiber_g), "Fiber");
  if (updates.sugar_g !== undefined && updates.sugar_g !== null) assertNonNegative(Number(updates.sugar_g), "Sugar");

  if (isGuest) {
    const rows = parseGuestEntries();
    const idx = rows.findIndex((row) => row.id === id);
    if (idx < 0) return null;
    const next = { ...rows[idx], ...updates } as NutritionEntry;
    rows[idx] = next;
    saveGuestEntries(rows);
    return next;
  }
  if (!userId) return null;

  const { data, error } = await supabase
    .from("nutrition_entries")
    .update(updates as any)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data as NutritionEntry;
};

export const deleteNutritionEntry = async (id: string, userId: string | null, options?: { isGuest?: boolean }) => {
  const isGuest = options?.isGuest || false;
  if (!id) return;

  if (isGuest) {
    const rows = parseGuestEntries().filter((row) => row.id !== id);
    saveGuestEntries(rows);
    return;
  }
  if (!userId) return;

  const { error } = await supabase.from("nutrition_entries").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
};

export const getNutritionEntriesByMeal = async (
  userId: string | null,
  date: Date,
  options?: { isGuest?: boolean; timeZone?: string },
) => {
  const isGuest = options?.isGuest || false;
  const timeZone = options?.timeZone || DEFAULT_WATER_TIMEZONE;
  const dateKey = getDateKeyForTimezone(date, timeZone);

  let rows: NutritionEntry[] = [];
  if (isGuest) {
    rows = parseGuestEntries()
      .filter((row) => row.date_key === dateKey)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  } else if (userId) {
    const { data, error } = await supabase
      .from("nutrition_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("date_key", dateKey)
      .order("created_at", { ascending: true });
    if (error) throw error;
    rows = (data || []) as NutritionEntry[];
  }

  const groups: Record<NutritionMealType, NutritionEntry[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };
  rows.forEach((row) => groups[row.meal_type].push(row));

  return groups;
};

export const getNutritionDaySummary = async (
  userId: string | null,
  date: Date,
  options?: { isGuest?: boolean; timeZone?: string },
) => {
  const groups = await getNutritionEntriesByMeal(userId, date, options);
  const allEntries = [...groups.breakfast, ...groups.lunch, ...groups.dinner, ...groups.snack];
  const totals = roundTotals(aggregateTotals(allEntries));
  const goals = await getNutritionGoals(userId, { isGuest: options?.isGuest });
  const lastEntry = [...allEntries].sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null;

  const mealTotals: Record<NutritionMealType, NutritionMacroTotals> = {
    breakfast: roundTotals(aggregateTotals(groups.breakfast)),
    lunch: roundTotals(aggregateTotals(groups.lunch)),
    dinner: roundTotals(aggregateTotals(groups.dinner)),
    snack: roundTotals(aggregateTotals(groups.snack)),
  };

  return {
    groups,
    totals,
    mealTotals,
    goals,
    lastEntry,
  };
};

export const getNutritionRangeSummary = async (
  userId: string | null,
  from: Date,
  to: Date,
  options?: { isGuest?: boolean; timeZone?: string },
) => {
  const isGuest = options?.isGuest || false;
  const timeZone = options?.timeZone || DEFAULT_WATER_TIMEZONE;
  const fromKey = getDateKeyForTimezone(from, timeZone);
  const toKey = getDateKeyForTimezone(to, timeZone);

  let rows: NutritionEntry[] = [];
  if (isGuest) {
    rows = parseGuestEntries()
      .filter((row) => row.date_key >= fromKey && row.date_key <= toKey)
      .sort((a, b) => a.date_key.localeCompare(b.date_key));
  } else if (userId) {
    const { data, error } = await supabase
      .from("nutrition_entries")
      .select("*")
      .eq("user_id", userId)
      .gte("date_key", fromKey)
      .lte("date_key", toKey)
      .order("date_key", { ascending: true });
    if (error) throw error;
    rows = (data || []) as NutritionEntry[];
  }

  const dayMap = new Map<string, NutritionEntry[]>();
  rows.forEach((row) => {
    dayMap.set(row.date_key, [...(dayMap.get(row.date_key) || []), row]);
  });

  const days = createDateKeyRange(from, to).map((dateKey) => {
    const entries = dayMap.get(dateKey) || [];
    const totals = roundTotals(aggregateTotals(entries));
    return {
      date_key: dateKey,
      entries_count: entries.length,
      ...totals,
    };
  });

  const averages =
    days.length > 0
      ? {
          calories: Math.round(days.reduce((sum, day) => sum + day.calories, 0) / days.length),
          protein_g: Number((days.reduce((sum, day) => sum + day.protein_g, 0) / days.length).toFixed(1)),
          carbs_g: Number((days.reduce((sum, day) => sum + day.carbs_g, 0) / days.length).toFixed(1)),
          fat_g: Number((days.reduce((sum, day) => sum + day.fat_g, 0) / days.length).toFixed(1)),
        }
      : { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };

  return { days, averages };
};

export const listRecentNutritionEntries = async (
  userId: string | null,
  limit = 12,
  options?: { isGuest?: boolean },
): Promise<NutritionEntry[]> => {
  const isGuest = options?.isGuest || false;
  if (isGuest) return parseGuestEntries().sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit);
  if (!userId) return [];

  const { data, error } = await supabase
    .from("nutrition_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as NutritionEntry[];
};

export const getFavoriteFoods = async (userId: string | null, options?: { isGuest?: boolean }): Promise<FavoriteFood[]> => {
  const isGuest = options?.isGuest || false;
  if (isGuest) return parseGuestFavorites().sort((a, b) => b.created_at.localeCompare(a.created_at));
  if (!userId) return [];

  const { data, error } = await supabase
    .from("nutrition_favorites")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as FavoriteFood[];
};

export const saveFavoriteFood = async (
  userId: string | null,
  payload: {
    name: string;
    serving_size: number;
    serving_unit: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g?: number | null;
  },
  options?: { isGuest?: boolean },
): Promise<FavoriteFood | null> => {
  const isGuest = options?.isGuest || false;
  const name = payload.name.trim();
  if (!name) throw new Error("Name is required.");
  assertNonNegative(Number(payload.serving_size), "Serving size");
  assertNonNegative(Number(payload.calories), "Calories");
  assertNonNegative(Number(payload.protein_g), "Protein");
  assertNonNegative(Number(payload.carbs_g), "Carbs");
  assertNonNegative(Number(payload.fat_g), "Fat");
  if (payload.fiber_g !== null && payload.fiber_g !== undefined) assertNonNegative(Number(payload.fiber_g), "Fiber");

  const base = {
    name,
    serving_size: Number(payload.serving_size),
    serving_unit: payload.serving_unit.trim() || "g",
    calories: Number(payload.calories),
    protein_g: Number(payload.protein_g),
    carbs_g: Number(payload.carbs_g),
    fat_g: Number(payload.fat_g),
    fiber_g: payload.fiber_g === null || payload.fiber_g === undefined ? null : Number(payload.fiber_g),
  };

  if (isGuest) {
    const next: FavoriteFood = {
      id: crypto.randomUUID(),
      user_id: "guest",
      created_at: new Date().toISOString(),
      ...base,
    };
    const rows = [next, ...parseGuestFavorites().filter((row) => row.name.toLowerCase() !== name.toLowerCase())];
    saveGuestFavorites(rows);
    return next;
  }
  if (!userId) return null;

  const { data, error } = await supabase
    .from("nutrition_favorites")
    .insert({ user_id: userId, ...base })
    .select("*")
    .single();
  if (error) throw error;
  return data as FavoriteFood;
};

export const getNutritionGoals = async (userId: string | null, options?: { isGuest?: boolean }): Promise<NutritionGoals> => {
  const isGuest = options?.isGuest || false;
  if (isGuest) return getGuestGoals();
  if (!userId) return DEFAULT_NUTRITION_GOALS;

  const { data, error } = await supabase
    .from("profiles")
    .select("calorie_goal,protein_goal_g,carb_goal_g,fat_goal_g")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;

  return {
    calorie_goal: Number(data?.calorie_goal ?? DEFAULT_NUTRITION_GOALS.calorie_goal),
    protein_goal_g: Number(data?.protein_goal_g ?? DEFAULT_NUTRITION_GOALS.protein_goal_g),
    carb_goal_g: Number(data?.carb_goal_g ?? DEFAULT_NUTRITION_GOALS.carb_goal_g),
    fat_goal_g: Number(data?.fat_goal_g ?? DEFAULT_NUTRITION_GOALS.fat_goal_g),
  };
};

export const updateNutritionGoals = async (
  userId: string | null,
  goals: Partial<NutritionGoals>,
  options?: { isGuest?: boolean },
): Promise<NutritionGoals> => {
  const next: NutritionGoals = {
    calorie_goal: Number(goals.calorie_goal ?? DEFAULT_NUTRITION_GOALS.calorie_goal),
    protein_goal_g: Number(goals.protein_goal_g ?? DEFAULT_NUTRITION_GOALS.protein_goal_g),
    carb_goal_g: Number(goals.carb_goal_g ?? DEFAULT_NUTRITION_GOALS.carb_goal_g),
    fat_goal_g: Number(goals.fat_goal_g ?? DEFAULT_NUTRITION_GOALS.fat_goal_g),
  };
  assertNonNegative(next.calorie_goal, "Calorie goal");
  assertNonNegative(next.protein_goal_g, "Protein goal");
  assertNonNegative(next.carb_goal_g, "Carb goal");
  assertNonNegative(next.fat_goal_g, "Fat goal");

  const isGuest = options?.isGuest || false;
  if (isGuest) {
    saveGuestGoals(next);
    return next;
  }
  if (!userId) return next;

  const { error } = await supabase.from("profiles").update(next).eq("id", userId);
  if (error) throw error;
  return next;
};

export const searchFoodDatabase = async (params?: {
  query?: string;
  category?: string | null;
  limit?: number;
}): Promise<FoodDatabaseItem[]> => {
  const query = params?.query?.trim() || "";
  const category = params?.category?.trim() || "";
  const limit = Math.max(1, Math.min(100, Number(params?.limit ?? 25)));

  let request = supabase.from("food_database").select("*").order("food_name", { ascending: true }).limit(limit);
  if (category && category !== "all") {
    request = request.eq("category", category);
  }
  if (query) {
    request = request.ilike("food_name", `%${query}%`);
  }

  const { data, error } = await request;
  if (error) throw error;
  return (data || []) as FoodDatabaseItem[];
};

export const listFoodDatabaseCategories = async (): Promise<string[]> => {
  const { data, error } = await supabase.from("food_database").select("category");
  if (error) throw error;
  const unique = Array.from(new Set((data || []).map((row: any) => String(row.category || "").trim()).filter(Boolean)));
  return unique.sort((a, b) => a.localeCompare(b));
};

export const calculateNutritionFromFood = (food: FoodDatabaseItem, consumedAmount: number) => {
  const amount = Number(consumedAmount);
  assertNonNegative(amount, "Consumed amount");
  const base = Math.max(0.0001, Number(food.serving_size || 100));
  const ratio = amount / base;
  return {
    serving_size: amount,
    serving_unit: food.serving_unit,
    calories: Number((Number(food.calories || 0) * ratio).toFixed(1)),
    protein_g: Number((Number(food.protein_g || 0) * ratio).toFixed(1)),
    carbs_g: Number((Number(food.carbs_g || 0) * ratio).toFixed(1)),
    fat_g: Number((Number(food.fat_g || 0) * ratio).toFixed(1)),
    fiber_g: Number((Number(food.fiber_g || 0) * ratio).toFixed(1)),
    sugar_g: Number((Number(food.sugar_g || 0) * ratio).toFixed(1)),
  };
};
