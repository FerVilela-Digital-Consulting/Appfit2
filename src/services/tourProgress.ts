import { supabase } from "@/services/supabaseClient";

export type TourTabKey =
  | "today"
  | "training"
  | "nutrition"
  | "body"
  | "progress"
  | "calendar"
  | "fitness_profile"
  | "settings";

export type TourTabDefinition = {
  key: TourTabKey;
  route: string;
  title: string;
  description: string;
};

export type TourProgressState = {
  version: number;
  completedTabs: TourTabKey[];
  inviteResponded: boolean;
  updatedAt: string | null;
};

const TOUR_VERSION = 1;
const TOUR_STORAGE_PREFIX = "appfit_tour_progress_";
const TOUR_SCHEMA_FLAG_KEY = "appfit_tour_progress_schema_unavailable";
let tourSchemaUnavailable = localStorage.getItem(TOUR_SCHEMA_FLAG_KEY) === "true";
export const TOUR_INVITE_NOTIFICATION_ID = "local-tour-invite";

export const APP_TOUR_TABS: TourTabDefinition[] = [
  {
    key: "today",
    route: "/today",
    title: "Centro operativo",
    description: "Vista diaria de prioridades, modulos y acciones rapidas.",
  },
  {
    key: "training",
    route: "/training",
    title: "Entrenamiento",
    description: "Planifica rutinas, ejecuta sesiones y revisa progreso.",
  },
  {
    key: "nutrition",
    route: "/nutrition",
    title: "Nutricion",
    description: "Gestiona logbook, biblioteca y objetivos nutricionales.",
  },
  {
    key: "body",
    route: "/body",
    title: "Cuerpo",
    description: "Registra medidas corporales y compara evolucion.",
  },
  {
    key: "progress",
    route: "/progress",
    title: "Progreso",
    description: "Analiza tendencias y revision semanal en un solo contexto.",
  },
  {
    key: "calendar",
    route: "/calendar",
    title: "Calendario",
    description: "Sigue tu timeline operativo dia por dia.",
  },
  {
    key: "fitness_profile",
    route: "/fitness-profile",
    title: "Perfil fitness",
    description: "Configura objetivos y parametros metabolicos del plan.",
  },
  {
    key: "settings",
    route: "/settings",
    title: "Ajustes",
    description: "Personaliza app, cuenta y gestion de datos.",
  },
];

const createDefaultState = (): TourProgressState => ({
  version: TOUR_VERSION,
  completedTabs: [],
  inviteResponded: false,
  updatedAt: null,
});

const normalizeTourTabKeys = (value: unknown): TourTabKey[] => {
  if (!Array.isArray(value)) return [];
  const allowed = new Set(APP_TOUR_TABS.map((tab) => tab.key));
  const keys = value.filter((item): item is TourTabKey => typeof item === "string" && allowed.has(item as TourTabKey));
  return Array.from(new Set(keys));
};

const normalizeState = (value: unknown): TourProgressState => {
  if (!value || typeof value !== "object") return createDefaultState();
  const raw = value as Partial<TourProgressState>;
  return {
    version: TOUR_VERSION,
    completedTabs: normalizeTourTabKeys(raw.completedTabs),
    inviteResponded: Boolean(raw.inviteResponded),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
  };
};

const getStorageKey = (userId: string | null, isGuest: boolean) =>
  `${TOUR_STORAGE_PREFIX}${isGuest ? "guest" : userId ?? "anon"}`;

const getLocalTourProgress = (userId: string | null, options?: { isGuest?: boolean }) => {
  const isGuest = options?.isGuest ?? false;
  const key = getStorageKey(userId, isGuest);
  const raw = localStorage.getItem(key);
  if (!raw) return createDefaultState();
  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    return createDefaultState();
  }
};

const saveLocalTourProgress = (
  userId: string | null,
  state: Partial<TourProgressState>,
  options?: { isGuest?: boolean },
) => {
  const isGuest = options?.isGuest ?? false;
  const current = getLocalTourProgress(userId, { isGuest });
  const next = normalizeState({
    ...current,
    ...state,
    updatedAt: new Date().toISOString(),
  });
  localStorage.setItem(getStorageKey(userId, isGuest), JSON.stringify(next));
  return next;
};

const markSchemaUnavailable = () => {
  tourSchemaUnavailable = true;
  localStorage.setItem(TOUR_SCHEMA_FLAG_KEY, "true");
};

const clearSchemaUnavailable = () => {
  tourSchemaUnavailable = false;
  localStorage.removeItem(TOUR_SCHEMA_FLAG_KEY);
};

const isSchemaMissingError = (error: unknown) => {
  const message = (error as { message?: string } | null)?.message?.toLowerCase() ?? "";
  const status = (error as { status?: number } | null)?.status;
  return (
    status === 400 ||
    message.includes("app_tour_progress") ||
    message.includes("schema cache") ||
    message.includes("could not find") ||
    message.includes("column")
  );
};

export const getTourProgressState = async (userId: string | null, options?: { isGuest?: boolean }) => {
  const isGuest = options?.isGuest ?? false;
  if (isGuest || !userId) return getLocalTourProgress(userId, { isGuest });
  if (tourSchemaUnavailable) return getLocalTourProgress(userId, { isGuest: false });

  const { data, error } = await supabase.from("profiles").select("app_tour_progress").eq("id", userId).maybeSingle();
  if (error) {
    if (isSchemaMissingError(error)) {
      markSchemaUnavailable();
      return getLocalTourProgress(userId, { isGuest: false });
    }
    throw error;
  }

  clearSchemaUnavailable();
  const normalized = normalizeState((data as { app_tour_progress?: unknown } | null)?.app_tour_progress);
  saveLocalTourProgress(userId, normalized, { isGuest: false });
  return normalized;
};

export const saveTourProgressState = async (
  userId: string | null,
  state: Partial<TourProgressState>,
  options?: { isGuest?: boolean },
) => {
  const isGuest = options?.isGuest ?? false;
  if (isGuest || !userId) {
    return saveLocalTourProgress(userId, state, { isGuest });
  }

  const current = await getTourProgressState(userId, { isGuest: false });
  const next = normalizeState({
    ...current,
    ...state,
    updatedAt: new Date().toISOString(),
  });
  saveLocalTourProgress(userId, next, { isGuest: false });

  if (tourSchemaUnavailable) {
    return next;
  }

  const { error } = await supabase.from("profiles").update({ app_tour_progress: next }).eq("id", userId);
  if (error) {
    if (isSchemaMissingError(error)) {
      markSchemaUnavailable();
      return next;
    }
    throw error;
  }

  clearSchemaUnavailable();
  return next;
};

export const isTourCompleted = (state: TourProgressState) => state.completedTabs.length >= APP_TOUR_TABS.length;

export const getTourTabByPath = (pathname: string) => APP_TOUR_TABS.find((tab) => tab.route === pathname) ?? null;

export const getNextIncompleteTourTab = (state: TourProgressState) =>
  APP_TOUR_TABS.find((tab) => !state.completedTabs.includes(tab.key)) ?? null;

export const markTourTabCompleted = async (userId: string | null, tabKey: TourTabKey, options?: { isGuest?: boolean }) => {
  const state = await getTourProgressState(userId, options);
  const completedTabs = Array.from(new Set([...state.completedTabs, tabKey]));
  return saveTourProgressState(
    userId,
    {
      completedTabs,
      inviteResponded: state.inviteResponded || completedTabs.length > 0,
    },
    options,
  );
};

export const markTourInviteResponded = (userId: string | null, options?: { isGuest?: boolean }) =>
  saveTourProgressState(userId, { inviteResponded: true }, options);

export const shouldPromptTourInvite = (state: TourProgressState) => !state.inviteResponded && !isTourCompleted(state);
