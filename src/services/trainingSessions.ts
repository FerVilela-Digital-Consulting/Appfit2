import { createClientId } from "@/lib/id";
import { MAX_NOTES_LENGTH } from "@/services/trainingHelpers";
import { loadExercisesByIds } from "@/services/trainingCatalog";
import { readGuestTrainingState, saveGuestTrainingState } from "@/services/trainingGuestState";
import {
  normalizeExercisePr,
  normalizeExerciseSet,
  normalizeSessionNote,
  normalizeWorkout,
  normalizeWorkoutExercise,
  normalizeWorkoutSession,
} from "@/services/trainingNormalization";
import { isRpcMissingError, type TrainingOptions } from "@/services/trainingShared";
import { supabase } from "@/services/supabaseClient";
import type {
  ActiveWorkoutExercise,
  ExerciseHistoryEntry,
  ExercisePrRecord,
  ExerciseProgressPoint,
  ExerciseSetRecord,
  LastExercisePerformance,
  SessionExerciseNoteRecord,
  UpsertExerciseSetInput,
  WorkoutExerciseRecord,
  WorkoutRecord,
  WorkoutSessionDetail,
  WorkoutSessionRecord,
} from "@/types/training";

const readGuestState = readGuestTrainingState;
const saveGuestState = saveGuestTrainingState;

const round1 = (value: number) => Math.round(value * 10) / 10;
const round2 = (value: number) => Math.round(value * 100) / 100;
const clampNonNegative = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);
const estimateOneRm = (weight: number, reps: number) => {
  const safeWeight = clampNonNegative(weight);
  const safeReps = Math.max(Number(reps) || 0, 0);
  if (safeWeight === 0 || safeReps === 0) return 0;
  return round1(safeWeight * (1 + safeReps / 30));
};
const computeSetVolume = (set: Pick<ExerciseSetRecord, "weight" | "reps">) => round2(clampNonNegative(set.weight) * Math.max(Number(set.reps) || 0, 0));

const getLastPerformanceMap = async (
  userId: string | null,
  exerciseIds: string[],
  currentSessionId: string | null,
  options?: TrainingOptions,
): Promise<Map<string, LastExercisePerformance>> => {
  if (exerciseIds.length === 0) return new Map();

  let sessions: WorkoutSessionRecord[] = [];
  let sets: ExerciseSetRecord[] = [];

  if (options?.isGuest) {
    const state = readGuestState();
    sessions = state.sessions.filter((row) => row.status === "completed" && row.id !== currentSessionId);
    sets = state.sets.filter((row) => exerciseIds.includes(row.exercise_id) && row.completed);
  } else {
    if (!userId) return new Map();
    const [{ data: sessionData, error: sessionError }, { data: setData, error: setError }] = await Promise.all([
      supabase.from("workout_sessions").select("*").eq("user_id", userId).eq("status", "completed").order("started_at", { ascending: false }),
      supabase.from("exercise_sets").select("*").in("exercise_id", exerciseIds).eq("completed", true),
    ]);
    if (sessionError) throw sessionError;
    if (setError) throw setError;
    sessions = (sessionData || []).map(normalizeWorkoutSession).filter((row) => row.id !== currentSessionId);
    const sessionIds = new Set(sessions.map((row) => row.id));
    sets = (setData || []).map(normalizeExerciseSet).filter((row) => sessionIds.has(row.session_id));
  }

  const sessionMap = new Map(sessions.map((row) => [row.id, row]));
  const byExercise = new Map<string, ExerciseSetRecord[]>();
  sets.forEach((row) => {
    if (!sessionMap.has(row.session_id)) return;
    const current = byExercise.get(row.exercise_id) ?? [];
    current.push(row);
    byExercise.set(row.exercise_id, current);
  });

  const result = new Map<string, LastExercisePerformance>();
  exerciseIds.forEach((exerciseId) => {
    const sorted = (byExercise.get(exerciseId) ?? []).sort((a, b) => {
      const aStarted = sessionMap.get(a.session_id)?.started_at ?? "";
      const bStarted = sessionMap.get(b.session_id)?.started_at ?? "";
      return bStarted.localeCompare(aStarted) || a.set_number - b.set_number;
    });
    const latestSet = sorted[0];
    if (!latestSet) return;
    const latestSessionId = latestSet.session_id;
    const sessionSets = sorted.filter((row) => row.session_id === latestSessionId).sort((a, b) => a.set_number - b.set_number);
    result.set(exerciseId, {
      session_id: latestSessionId,
      performed_at: sessionMap.get(latestSessionId)?.started_at ?? latestSet.created_at,
      max_weight: round2(sessionSets.reduce((max, row) => Math.max(max, row.weight), 0)),
      total_volume: round2(sessionSets.reduce((sum, row) => sum + computeSetVolume(row), 0)),
      sets: sessionSets.map((row) => ({
        set_number: row.set_number,
        weight: row.weight,
        reps: row.reps,
        rir: row.rir,
      })),
    });
  });

  return result;
};

export const getWorkoutSessionDetail = async (
  userId: string | null,
  sessionId: string,
  options?: TrainingOptions,
): Promise<WorkoutSessionDetail | null> => {
  let session: WorkoutSessionRecord | null = null;
  let workout: WorkoutRecord | null = null;
  let workoutExercises: WorkoutExerciseRecord[] = [];
  let sets: ExerciseSetRecord[] = [];
  let sessionNotes: SessionExerciseNoteRecord[] = [];

  if (options?.isGuest) {
    const state = readGuestState();
    session = state.sessions.find((row) => row.id === sessionId) ?? null;
    if (!session) return null;
    workout = state.workouts.find((row) => row.id === session.workout_id) ?? null;
    workoutExercises = state.workoutExercises.filter((row) => row.workout_id === session.workout_id);
    sets = state.sets.filter((row) => row.session_id === sessionId);
    sessionNotes = state.sessionNotes.filter((row) => row.session_id === sessionId);
  } else {
    if (!userId) return null;
    const [{ data: sessionData, error: sessionError }, { data: setData, error: setError }, { data: noteData, error: noteError }] =
      await Promise.all([
        supabase.from("workout_sessions").select("*").eq("user_id", userId).eq("id", sessionId).maybeSingle(),
        supabase.from("exercise_sets").select("*").eq("session_id", sessionId).order("set_number", { ascending: true }),
        supabase.from("session_exercise_notes").select("*").eq("session_id", sessionId),
      ]);
    if (sessionError) throw sessionError;
    if (setError) throw setError;
    if (noteError) throw noteError;
    if (!sessionData) return null;
    session = normalizeWorkoutSession(sessionData);
    const [{ data: workoutData, error: workoutError }, { data: workoutExerciseData, error: workoutExerciseError }] = await Promise.all([
      supabase.from("workouts").select("*").eq("id", session.workout_id).maybeSingle(),
      supabase.from("workout_exercises").select("*").eq("workout_id", session.workout_id).order("order_index", { ascending: true }),
    ]);
    if (workoutError) throw workoutError;
    if (workoutExerciseError) throw workoutExerciseError;
    if (!workoutData) return null;
    workout = normalizeWorkout(workoutData);
    workoutExercises = (workoutExerciseData || []).map(normalizeWorkoutExercise);
    sets = (setData || []).map(normalizeExerciseSet);
    sessionNotes = (noteData || []).map(normalizeSessionNote);
  }

  if (!session || !workout) return null;
  const exerciseMap = await loadExercisesByIds(userId, workoutExercises.map((row) => row.exercise_id), options);
  const lastPerformanceMap = await getLastPerformanceMap(userId, workoutExercises.map((row) => row.exercise_id), session.id, options);
  const exercises: ActiveWorkoutExercise[] = workoutExercises
    .sort((a, b) => a.order_index - b.order_index)
    .map((row) => ({
      ...row,
      exercise: exerciseMap.get(row.exercise_id)!,
      sets: sets.filter((set) => set.exercise_id === row.exercise_id).sort((a, b) => a.set_number - b.set_number),
      sessionNote: sessionNotes.find((note) => note.exercise_id === row.exercise_id) ?? null,
      lastPerformance: lastPerformanceMap.get(row.exercise_id) ?? null,
    }));

  return {
    ...session,
    workout,
    exercises,
  };
};

export const getActiveWorkoutSession = async (userId: string | null, options?: TrainingOptions) => {
  if (options?.isGuest) {
    const active = readGuestState().sessions.filter((row) => row.status === "active").sort((a, b) => b.started_at.localeCompare(a.started_at))[0];
    return active ? getWorkoutSessionDetail(userId, active.id, options) : null;
  }
  if (!userId) return null;
  const { data, error } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return getWorkoutSessionDetail(userId, String(data.id), options);
};

export const startWorkoutSession = async (userId: string | null, workoutId: string, options?: TrainingOptions) => {
  const existing = await getActiveWorkoutSession(userId, options);
  if (existing) return existing;

  if (options?.isGuest) {
    const state = readGuestState();
    const next: WorkoutSessionRecord = {
      id: createClientId(),
      user_id: userId ?? "guest",
      workout_id: workoutId,
      started_at: new Date().toISOString(),
      ended_at: null,
      status: "active",
      notes: null,
      total_volume: 0,
      created_at: new Date().toISOString(),
    };
    saveGuestState({ ...state, sessions: [next, ...state.sessions] });
    return getWorkoutSessionDetail(userId, next.id, options);
  }
  if (!userId) throw new Error("No se encontro el usuario.");
  try {
    const { data, error } = await supabase.rpc("start_workout_session_safe", {
      p_user_id: userId,
      p_workout_id: workoutId,
    });
    if (error) throw error;
    const sessionId =
      typeof data === "string"
        ? data
        : data && typeof data === "object" && "id" in data && typeof data.id === "string"
        ? data.id
        : data && typeof data === "object" && "session_id" in data && typeof data.session_id === "string"
        ? data.session_id
        : null;
    if (sessionId) return getWorkoutSessionDetail(userId, sessionId, options);
  } catch (error) {
    if (!isRpcMissingError(error)) throw error;
  }
  const { data, error } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: userId,
      workout_id: workoutId,
      started_at: new Date().toISOString(),
      status: "active",
      total_volume: 0,
    })
    .select("*")
    .single();
  if (error) throw error;
  return getWorkoutSessionDetail(userId, String(data.id), options);
};

export const upsertExerciseSet = async (userId: string | null, input: UpsertExerciseSetInput, options?: TrainingOptions) => {
  if (!Number.isInteger(input.set_number) || input.set_number < 1 || input.set_number > 50) {
    throw new Error("El numero de serie no es valido.");
  }
  if ((input.notes ?? "").trim().length > MAX_NOTES_LENGTH) {
    throw new Error("La nota de la serie es demasiado larga.");
  }
  const payload: ExerciseSetRecord = {
    id: createClientId(),
    session_id: input.session_id,
    exercise_id: input.exercise_id,
    set_number: input.set_number,
    weight: round2(clampNonNegative(input.weight)),
    reps: Math.max(Number(input.reps) || 0, 0),
    rir: input.rir === null || input.rir === undefined ? null : Number(input.rir),
    completed: Boolean(input.completed),
    notes: input.notes ?? null,
    created_at: new Date().toISOString(),
  };

  if (options?.isGuest) {
    const state = readGuestState();
    const existing = state.sets.find(
      (row) => row.session_id === input.session_id && row.exercise_id === input.exercise_id && row.set_number === input.set_number,
    );
    const next = [...state.sets.filter(
      (row) => !(row.session_id === input.session_id && row.exercise_id === input.exercise_id && row.set_number === input.set_number),
    ), existing ? { ...existing, ...payload, id: existing.id, created_at: existing.created_at } : payload];
    saveGuestState({ ...state, sets: next });
    return existing ? { ...existing, ...payload, id: existing.id, created_at: existing.created_at } : payload;
  }

  const { data, error } = await supabase
    .from("exercise_sets")
    .upsert(
      {
        session_id: input.session_id,
        exercise_id: input.exercise_id,
        set_number: input.set_number,
        weight: payload.weight,
        reps: payload.reps,
        rir: payload.rir,
        completed: payload.completed,
        notes: payload.notes,
      },
      { onConflict: "session_id,exercise_id,set_number" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return normalizeExerciseSet(data);
};

export const deleteExerciseSet = async (
  userId: string | null,
  sessionId: string,
  exerciseId: string,
  setNumber: number,
  options?: TrainingOptions,
) => {
  if (options?.isGuest) {
    const state = readGuestState();
    saveGuestState({
      ...state,
      sets: state.sets.filter(
        (row) => !(row.session_id === sessionId && row.exercise_id === exerciseId && row.set_number === setNumber),
      ),
    });
    return;
  }
  if (!userId) return;
  const { error } = await supabase
    .from("exercise_sets")
    .delete()
    .eq("session_id", sessionId)
    .eq("exercise_id", exerciseId)
    .eq("set_number", setNumber);
  if (error) throw error;
};

export const upsertSessionExerciseNote = async (
  userId: string | null,
  sessionId: string,
  exerciseId: string,
  notes: string | null,
  options?: TrainingOptions,
) => {
  if ((notes ?? "").trim().length > MAX_NOTES_LENGTH) {
    throw new Error("La nota del ejercicio es demasiado larga.");
  }
  const now = new Date().toISOString();
  if (options?.isGuest) {
    const state = readGuestState();
    const existing = state.sessionNotes.find((row) => row.session_id === sessionId && row.exercise_id === exerciseId);
    const next: SessionExerciseNoteRecord = {
      id: existing?.id ?? createClientId(),
      session_id: sessionId,
      exercise_id: exerciseId,
      notes,
      created_at: existing?.created_at ?? now,
      updated_at: now,
    };
    saveGuestState({
      ...state,
      sessionNotes: [...state.sessionNotes.filter((row) => !(row.session_id === sessionId && row.exercise_id === exerciseId)), next],
    });
    return next;
  }
  if (!userId) throw new Error("No se encontro el usuario.");
  const { data, error } = await supabase
    .from("session_exercise_notes")
    .upsert(
      {
        session_id: sessionId,
        exercise_id: exerciseId,
        notes,
        updated_at: now,
      },
      { onConflict: "session_id,exercise_id" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return normalizeSessionNote(data);
};

const evaluateSessionPrs = async (userId: string | null, detail: WorkoutSessionDetail, options?: TrainingOptions) => {
  const metrics = detail.exercises.flatMap((exercise) => {
    const completedSets = exercise.sets.filter((set) => set.completed);
    if (completedSets.length === 0) return [];
    const maxWeightSet = completedSets.reduce((best, current) => (current.weight > best.weight ? current : best), completedSets[0]);
    const bestOneRmSet = completedSets.reduce(
      (best, current) => (estimateOneRm(current.weight, current.reps) > estimateOneRm(best.weight, best.reps) ? current : best),
      completedSets[0],
    );
    return [
      { exercise_id: exercise.exercise_id, pr_type: "max_weight" as const, value_num: round2(maxWeightSet.weight), set_id: maxWeightSet.id, metadata: { reps: maxWeightSet.reps } },
      { exercise_id: exercise.exercise_id, pr_type: "estimated_1rm" as const, value_num: estimateOneRm(bestOneRmSet.weight, bestOneRmSet.reps), set_id: bestOneRmSet.id, metadata: { weight: bestOneRmSet.weight, reps: bestOneRmSet.reps } },
      { exercise_id: exercise.exercise_id, pr_type: "max_volume" as const, value_num: round2(completedSets.reduce((sum, set) => sum + computeSetVolume(set), 0)), set_id: null, metadata: { sets: completedSets.length } },
    ];
  });

  const exerciseIds = Array.from(new Set(metrics.map((row) => row.exercise_id)));
  let existing: ExercisePrRecord[] = [];
  if (options?.isGuest) {
    existing = readGuestState().prs.filter((row) => exerciseIds.includes(row.exercise_id));
  } else if (userId) {
    const { data, error } = await supabase.from("exercise_prs").select("*").eq("user_id", userId).in("exercise_id", exerciseIds);
    if (error) throw error;
    existing = (data || []).map(normalizeExercisePr);
  }
  const existingMap = new Map(existing.map((row) => [`${row.exercise_id}:${row.pr_type}`, row]));
  const newPrs: ExercisePrRecord[] = [];

  metrics.forEach((metric) => {
    const key = `${metric.exercise_id}:${metric.pr_type}`;
    const current = existingMap.get(key);
    if (current && current.value_num >= metric.value_num) return;
    newPrs.push({
      id: current?.id ?? createClientId(),
      user_id: userId ?? "guest",
      exercise_id: metric.exercise_id,
      pr_type: metric.pr_type,
      value_num: round2(metric.value_num),
      achieved_at: detail.ended_at ?? new Date().toISOString(),
      session_id: detail.id,
      set_id: metric.set_id,
      metadata: metric.metadata,
      created_at: current?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  });

  if (newPrs.length === 0) return [];
  if (options?.isGuest) {
    const state = readGuestState();
    saveGuestState({
      ...state,
      prs: [...state.prs.filter((row) => !newPrs.some((next) => next.exercise_id === row.exercise_id && next.pr_type === row.pr_type)), ...newPrs],
    });
  } else {
    const { error } = await supabase.from("exercise_prs").upsert(
      newPrs.map((row) => ({
        id: row.id,
        user_id: row.user_id,
        exercise_id: row.exercise_id,
        pr_type: row.pr_type,
        value_num: row.value_num,
        achieved_at: row.achieved_at,
        session_id: row.session_id,
        set_id: row.set_id,
        metadata: row.metadata,
        updated_at: row.updated_at,
      })),
      { onConflict: "user_id,exercise_id,pr_type" },
    );
    if (error) throw error;
  }
  return newPrs;
};

export const finishWorkoutSession = async (
  userId: string | null,
  sessionId: string,
  params?: { notes?: string | null; status?: "completed" | "cancelled" },
  options?: TrainingOptions,
) => {
  const detail = await getWorkoutSessionDetail(userId, sessionId, options);
  if (!detail) throw new Error("No se encontró la sesión.");
  const status = params?.status ?? "completed";
  const totalVolume = round2(detail.exercises.reduce((sum, exercise) => sum + exercise.sets.filter((set) => set.completed).reduce((inner, set) => inner + computeSetVolume(set), 0), 0));
  const endedAt = new Date().toISOString();

  if (options?.isGuest) {
    const state = readGuestState();
    saveGuestState({
      ...state,
      sessions: state.sessions.map((row) =>
        row.id === sessionId ? { ...row, status, notes: params?.notes ?? row.notes, ended_at: endedAt, total_volume: totalVolume } : row,
      ),
    });
  } else {
    const { error } = await supabase
      .from("workout_sessions")
      .update({
        status,
        notes: params?.notes ?? detail.notes,
        ended_at: endedAt,
        total_volume: totalVolume,
      })
      .eq("id", sessionId)
      .eq("user_id", userId ?? "");
    if (error) throw error;
  }

  const updated = await getWorkoutSessionDetail(userId, sessionId, options);
  if (!updated) throw new Error("No se pudo recargar la sesión.");
  const prs = status === "completed" ? await evaluateSessionPrs(userId, updated, options) : [];
  return { session: updated, prs };
};

export const listWorkoutHistory = async (userId: string | null, options?: TrainingOptions) => {
  if (options?.isGuest) {
    const state = readGuestState();
    const workoutMap = new Map(state.workouts.map((row) => [row.id, row]));
    return state.sessions
      .filter((row) => row.status !== "active")
      .sort((a, b) => b.started_at.localeCompare(a.started_at))
      .map((row) => ({ ...row, workout_name: workoutMap.get(row.workout_id)?.name ?? "Rutina" }));
  }
  if (!userId) return [];
  const [{ data: sessionData, error: sessionError }, { data: workoutsData, error: workoutsError }] = await Promise.all([
    supabase.from("workout_sessions").select("*").eq("user_id", userId).neq("status", "active").order("started_at", { ascending: false }).limit(40),
    supabase.from("workouts").select("*").eq("user_id", userId),
  ]);
  if (sessionError) throw sessionError;
  if (workoutsError) throw workoutsError;
  const workoutMap = new Map((workoutsData || []).map((row) => {
    const normalized = normalizeWorkout(row);
    return [normalized.id, normalized];
  }));
  return (sessionData || []).map(normalizeWorkoutSession).map((row) => ({ ...row, workout_name: workoutMap.get(row.workout_id)?.name ?? "Rutina" }));
};

export const getExerciseHistory = async (userId: string | null, exerciseId: string, options?: TrainingOptions): Promise<ExerciseHistoryEntry[]> => {
  let sessions: WorkoutSessionRecord[] = [];
  let sets: ExerciseSetRecord[] = [];
  let workouts = new Map<string, WorkoutRecord>();

  if (options?.isGuest) {
    const state = readGuestState();
    sessions = state.sessions.filter((row) => row.status === "completed");
    sets = state.sets.filter((row) => row.exercise_id === exerciseId && row.completed);
    workouts = new Map(state.workouts.map((row) => [row.id, row]));
  } else {
    if (!userId) return [];
    const [{ data: sessionData, error: sessionError }, { data: setData, error: setError }, { data: workoutData, error: workoutError }] = await Promise.all([
      supabase.from("workout_sessions").select("*").eq("user_id", userId).eq("status", "completed").order("started_at", { ascending: false }),
      supabase.from("exercise_sets").select("*").eq("exercise_id", exerciseId).eq("completed", true),
      supabase.from("workouts").select("*").eq("user_id", userId),
    ]);
    if (sessionError) throw sessionError;
    if (setError) throw setError;
    if (workoutError) throw workoutError;
    sessions = (sessionData || []).map(normalizeWorkoutSession);
    sets = (setData || []).map(normalizeExerciseSet);
    workouts = new Map((workoutData || []).map((row) => {
      const normalized = normalizeWorkout(row);
      return [normalized.id, normalized];
    }));
  }

  const sessionMap = new Map(sessions.map((row) => [row.id, row]));
  const grouped = new Map<string, ExerciseSetRecord[]>();
  sets.forEach((row) => {
    if (!sessionMap.has(row.session_id)) return;
    const current = grouped.get(row.session_id) ?? [];
    current.push(row);
    grouped.set(row.session_id, current);
  });

  return Array.from(grouped.entries())
    .map(([sessionId, sessionSets]) => {
      const session = sessionMap.get(sessionId)!;
      return {
        session_id: sessionId,
        started_at: session.started_at,
        workout_name: workouts.get(session.workout_id)?.name ?? "Rutina",
        total_volume: round2(sessionSets.reduce((sum, set) => sum + computeSetVolume(set), 0)),
        max_weight: round2(sessionSets.reduce((max, set) => Math.max(max, set.weight), 0)),
        estimated_1rm: round1(sessionSets.reduce((max, set) => Math.max(max, estimateOneRm(set.weight, set.reps)), 0)),
        sets: sessionSets.sort((a, b) => a.set_number - b.set_number),
      };
    })
    .sort((a, b) => b.started_at.localeCompare(a.started_at));
};

export const getExerciseProgress = async (
  userId: string | null,
  exerciseId: string,
  options?: TrainingOptions,
): Promise<ExerciseProgressPoint[]> => {
  return (await getExerciseHistory(userId, exerciseId, options))
    .map((entry) => ({
      date_key: entry.started_at.slice(0, 10),
      max_weight: entry.max_weight,
      total_volume: entry.total_volume,
      estimated_1rm: entry.estimated_1rm,
    }))
    .reverse();
};

export const getExercisePrs = async (userId: string | null, exerciseId: string, options?: TrainingOptions) => {
  if (options?.isGuest) {
    return readGuestState().prs.filter((row) => row.exercise_id === exerciseId);
  }
  if (!userId) return [];
  const { data, error } = await supabase.from("exercise_prs").select("*").eq("user_id", userId).eq("exercise_id", exerciseId);
  if (error) throw error;
  return (data || []).map(normalizeExercisePr);
};

