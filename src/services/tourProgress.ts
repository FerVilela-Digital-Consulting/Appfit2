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
  tools: Array<{
    title: string;
    summary: string;
    detail: string;
    href?: string;
  }>;
};

export type TourProgressState = {
  version: number;
  completedTabs: TourTabKey[];
  inviteResponded: boolean;
  readNotificationIds: string[];
  updatedAt: string | null;
};

const TOUR_VERSION = 1;
const TOUR_STORAGE_PREFIX = "appfit_tour_progress_";
const TOUR_SCHEMA_FLAG_KEY = "appfit_tour_progress_schema_unavailable";
let tourSchemaUnavailable = localStorage.getItem(TOUR_SCHEMA_FLAG_KEY) === "true";
export const TOUR_INVITE_NOTIFICATION_ID = "local-tour-invite";
export const TOUR_REPLAY_NOTIFICATION_ID = "local-tour-replay";
export const TOUR_CONTINUE_NOTIFICATION_ID = "local-tour-continue";

export const APP_TOUR_TABS: TourTabDefinition[] = [
  {
    key: "today",
    route: "/today",
    title: "Centro operativo",
    description: "Vista diaria de prioridades, modulos y acciones rapidas.",
    tools: [
      {
        title: "Que hacer hoy",
        summary: "Prioridad principal del dia",
        detail: "Te indica la siguiente accion clave para avanzar en tu adherencia diaria.",
      },
      {
        title: "Modulos diarios",
        summary: "Agua, sueno, peso y nutricion",
        detail: "Bloques rapidos para registrar o actualizar datos del dia sin salir de la vista.",
      },
      {
        title: "Entrenamiento de hoy",
        summary: "Rutina activa o programada",
        detail: "Resume la sesion del dia y te permite iniciar o continuar entrenamiento.",
      },
    ],
  },
  {
    key: "training",
    route: "/training",
    title: "Entrenamiento",
    description: "Planifica rutinas, ejecuta sesiones y revisa progreso.",
    tools: [
      {
        title: "Entrenar",
        summary: "Sesion actual y ejecucion",
        detail: "Gestiona sets, notas y cierre de sesion con seguimiento de rendimiento.",
      },
      {
        title: "Planificar",
        summary: "Rutinas y calendario semanal",
        detail: "Define que rutina toca cada dia y ajusta la carga de trabajo.",
      },
      {
        title: "Progreso",
        summary: "Historial y PRs",
        detail: "Consulta avances por ejercicio y marcas personales para tomar decisiones.",
      },
    ],
  },
  {
    key: "nutrition",
    route: "/nutrition",
    title: "Nutricion",
    description: "Gestiona logbook, biblioteca y objetivos nutricionales.",
    tools: [
      {
        title: "Resumen",
        summary: "Objetivo vs consumo",
        detail: "Muestra calorias y macros del dia contra tu plan nutricional activo.",
      },
      {
        title: "Logbook",
        summary: "Registro por comidas",
        detail: "Agrega, edita y elimina entradas para desayuno, almuerzo, cena y snacks.",
      },
      {
        title: "Biblioteca",
        summary: "Base y alimentos personalizados",
        detail: "Busca alimentos, usa favoritos y crea items propios para acelerar el registro.",
      },
    ],
  },
  {
    key: "body",
    route: "/body",
    title: "Cuerpo",
    description: "Registra medidas corporales y compara evolucion.",
    tools: [
      {
        title: "Nueva medicion",
        summary: "Perimetros corporales",
        detail: "Guarda cintura, cuello, cadera, muslo y brazo para evaluar cambios reales.",
      },
      {
        title: "Grafica de metricas",
        summary: "Tendencia por indicador",
        detail: "Visualiza la evolucion por rango de fechas para detectar patrones.",
      },
      {
        title: "Comparacion libre",
        summary: "Fecha inicial vs final",
        detail: "Compara dos mediciones y revisa delta por cada perimetro.",
      },
    ],
  },
  {
    key: "progress",
    route: "/progress",
    title: "Progreso",
    description: "Analiza tendencias y revision semanal en un solo contexto.",
    tools: [
      {
        title: "Resumen de objetivo",
        summary: "Estado global actual",
        detail: "Integra peso, sueno, nutricion y biofeedback para lectura ejecutiva.",
      },
      {
        title: "Graficas de tendencia",
        summary: "Evolucion por rango",
        detail: "Permite analizar comportamiento semanal/mensual con enfoque longitudinal.",
      },
      {
        title: "Revision semanal",
        summary: "Observaciones y ajustes",
        detail: "Guarda notas de la semana para mejorar decisiones del siguiente ciclo.",
      },
    ],
  },
  {
    key: "calendar",
    route: "/calendar",
    title: "Calendario",
    description: "Sigue tu timeline operativo dia por dia.",
    tools: [
      {
        title: "Vista mes",
        summary: "Mapa de actividad",
        detail: "Identifica rapidamente dias con registros o vacios operativos.",
      },
      {
        title: "Timeline diario",
        summary: "Orden cronologico",
        detail: "Muestra bloques reales por hora para comprender tu dia completo.",
      },
      {
        title: "Nota del dia",
        summary: "Contexto tactico",
        detail: "Captura observaciones y decisiones para cerrar el ciclo de aprendizaje diario.",
      },
    ],
  },
  {
    key: "fitness_profile",
    route: "/fitness-profile",
    title: "Perfil fitness",
    description: "Configura objetivos y parametros metabolicos del plan.",
    tools: [
      {
        title: "Datos base",
        summary: "Perfil personal y biologico",
        detail: "Centraliza variables que afectan calculo de objetivos y recomendaciones.",
      },
      {
        title: "Objetivo de peso",
        summary: "Direccion y fecha",
        detail: "Define si buscas bajar, subir o mantener y registra meta temporal.",
      },
      {
        title: "Metas metabolicas",
        summary: "Sueno, calorias y macros",
        detail: "Ajusta parametros que impactan nutricion y seguimiento operativo diario.",
      },
    ],
  },
  {
    key: "settings",
    route: "/settings",
    title: "Ajustes",
    description: "Personaliza app, cuenta y gestion de datos.",
    tools: [
      {
        title: "Preferencias visuales",
        summary: "Idioma, tema y color",
        detail: "Configura la experiencia de uso y apariencia general de la app.",
      },
      {
        title: "Gestion de datos",
        summary: "Limpieza y reinicio",
        detail: "Corrige fechas, limpia historial o reinicia cuenta con control.",
      },
      {
        title: "Cuenta",
        summary: "Cambio de sesion",
        detail: "Permite salir e ingresar con otra cuenta cuando lo necesites.",
      },
    ],
  },
];

const createDefaultState = (): TourProgressState => ({
  version: TOUR_VERSION,
  completedTabs: [],
  inviteResponded: false,
  readNotificationIds: [],
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
    readNotificationIds: Array.isArray(raw.readNotificationIds)
      ? Array.from(new Set(raw.readNotificationIds.filter((item): item is string => typeof item === "string")))
      : [],
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

export const getTourProgressLocalSnapshot = (userId: string | null, options?: { isGuest?: boolean }) =>
  getLocalTourProgress(userId, options);

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

export const getFirstTourTab = () => APP_TOUR_TABS[0] ?? null;

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

export const isTourNotificationRead = (
  state: TourProgressState,
  notificationId:
    | typeof TOUR_INVITE_NOTIFICATION_ID
    | typeof TOUR_REPLAY_NOTIFICATION_ID
    | typeof TOUR_CONTINUE_NOTIFICATION_ID,
) => state.readNotificationIds.includes(notificationId);

export const markTourNotificationRead = async (
  userId: string | null,
  notificationId:
    | typeof TOUR_INVITE_NOTIFICATION_ID
    | typeof TOUR_REPLAY_NOTIFICATION_ID
    | typeof TOUR_CONTINUE_NOTIFICATION_ID,
  options?: { isGuest?: boolean },
) => {
  const state = await getTourProgressState(userId, options);
  const nextReadNotificationIds = Array.from(new Set([...state.readNotificationIds, notificationId]));
  return saveTourProgressState(
    userId,
    {
      readNotificationIds: nextReadNotificationIds,
    },
    options,
  );
};

export const shouldPromptTourInvite = (state: TourProgressState) => !state.inviteResponded && !isTourCompleted(state);

export const restartTourProgress = (userId: string | null, options?: { isGuest?: boolean }) =>
  saveTourProgressState(
    userId,
    {
      completedTabs: [],
      inviteResponded: true,
      readNotificationIds: [],
    },
    options,
  );
