import { supabase } from "@/services/supabaseClient";
import { DEFAULT_WATER_TIMEZONE, getDateKeyForTimezone } from "@/features/water/waterUtils";

export type DailyNote = {
  id: string;
  user_id: string;
  date_key: string;
  title: string | null;
  content: string;
  created_at: string;
};

type SaveDailyNoteInput = {
  userId: string | null;
  date: Date;
  title?: string | null;
  content: string;
  isGuest?: boolean;
  timeZone?: string;
};

const GUEST_DAILY_NOTES_KEY = "appfit_guest_daily_notes";

const parseGuestNotes = (): DailyNote[] => {
  const raw = localStorage.getItem(GUEST_DAILY_NOTES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as DailyNote[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveGuestNotes = (rows: DailyNote[]) => {
  localStorage.setItem(GUEST_DAILY_NOTES_KEY, JSON.stringify(rows));
};

export const upsertDailyNote = async ({
  userId,
  date,
  title = null,
  content,
  isGuest = false,
  timeZone = DEFAULT_WATER_TIMEZONE,
}: SaveDailyNoteInput): Promise<DailyNote | null> => {
  const normalizedContent = content.trim();
  if (!normalizedContent) {
    throw new Error("El contenido de la nota no puede estar vacio.");
  }

  const dateKey = getDateKeyForTimezone(date, timeZone);
  const payload = {
    date_key: dateKey,
    title: title?.trim() || null,
    content: normalizedContent,
  };

  if (isGuest) {
    const rows = parseGuestNotes().filter((row) => row.date_key !== dateKey);
    const note: DailyNote = {
      id: crypto.randomUUID(),
      user_id: "guest",
      created_at: new Date().toISOString(),
      ...payload,
    };
    rows.push(note);
    rows.sort((a, b) => b.date_key.localeCompare(a.date_key));
    saveGuestNotes(rows);
    return note;
  }

  if (!userId) return null;

  const { data, error } = await supabase
    .from("daily_notes")
    .upsert({ user_id: userId, ...payload }, { onConflict: "user_id,date_key" })
    .select("*")
    .single();
  if (error) throw error;
  return data as DailyNote;
};

export const getDailyNote = async (
  userId: string | null,
  date: Date,
  options?: { isGuest?: boolean; timeZone?: string },
): Promise<DailyNote | null> => {
  const isGuest = options?.isGuest || false;
  const timeZone = options?.timeZone || DEFAULT_WATER_TIMEZONE;
  const dateKey = getDateKeyForTimezone(date, timeZone);

  if (isGuest) {
    return parseGuestNotes().find((row) => row.date_key === dateKey) ?? null;
  }
  if (!userId) return null;

  const { data, error } = await supabase
    .from("daily_notes")
    .select("*")
    .eq("user_id", userId)
    .eq("date_key", dateKey)
    .maybeSingle();
  if (error) throw error;
  return (data as DailyNote | null) ?? null;
};

export const listDailyNotesByRange = async (
  userId: string | null,
  from: Date,
  to: Date,
  options?: { isGuest?: boolean; timeZone?: string },
): Promise<DailyNote[]> => {
  const isGuest = options?.isGuest || false;
  const timeZone = options?.timeZone || DEFAULT_WATER_TIMEZONE;
  const fromKey = getDateKeyForTimezone(from, timeZone);
  const toKey = getDateKeyForTimezone(to, timeZone);

  if (isGuest) {
    return parseGuestNotes()
      .filter((row) => row.date_key >= fromKey && row.date_key <= toKey)
      .sort((a, b) => a.date_key.localeCompare(b.date_key));
  }
  if (!userId) return [];

  const { data, error } = await supabase
    .from("daily_notes")
    .select("*")
    .eq("user_id", userId)
    .gte("date_key", fromKey)
    .lte("date_key", toKey)
    .order("date_key", { ascending: true });
  if (error) throw error;
  return (data || []) as DailyNote[];
};

export const getLatestDailyNote = async (
  userId: string | null,
  options?: { isGuest?: boolean },
): Promise<DailyNote | null> => {
  const isGuest = options?.isGuest || false;
  if (isGuest) return parseGuestNotes().sort((a, b) => b.date_key.localeCompare(a.date_key))[0] ?? null;
  if (!userId) return null;

  const { data, error } = await supabase
    .from("daily_notes")
    .select("*")
    .eq("user_id", userId)
    .order("date_key", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as DailyNote | null) ?? null;
};
