import { DEFAULT_WATER_TIMEZONE, getDateKeyForTimezone } from "@/features/water/waterUtils";
import {
  deleteWorkout as deleteWorkoutImpl,
  duplicateTemplateToWorkout as duplicateTemplateToWorkoutImpl,
  getTrainingDayLabel as getTrainingDayLabelImpl,
  getWorkoutDetail as getWorkoutDetailImpl,
  listExercises as listExercisesImpl,
  listWorkoutSchedule as listWorkoutScheduleImpl,
  listWorkoutTemplates as listWorkoutTemplatesImpl,
  listWorkouts as listWorkoutsImpl,
  saveCustomExercise as saveCustomExerciseImpl,
  saveWorkout as saveWorkoutImpl,
  saveWorkoutScheduleDay as saveWorkoutScheduleDayImpl,
} from "@/services/trainingCatalog";
import {
  deleteExerciseSet as deleteExerciseSetImpl,
  finishWorkoutSession as finishWorkoutSessionImpl,
  getActiveWorkoutSession as getActiveWorkoutSessionImpl,
  getExerciseHistory as getExerciseHistoryImpl,
  getExerciseProgress as getExerciseProgressImpl,
  getExercisePrs as getExercisePrsImpl,
  getWorkoutSessionDetail as getWorkoutSessionDetailImpl,
  listWorkoutHistory as listWorkoutHistoryImpl,
  startWorkoutSession as startWorkoutSessionImpl,
  upsertExerciseSet as upsertExerciseSetImpl,
  upsertSessionExerciseNote as upsertSessionExerciseNoteImpl,
} from "@/services/trainingSessions";
import { type TrainingOptions } from "@/services/trainingShared";
import type {
  LocalizedText,
  TrainingTodaySummary,
} from "@/types/training";

export {
  getTrainingErrorMessage,
  getLocalizedText,
  validateExerciseInput,
  validateWorkoutInput,
} from "@/services/trainingHelpers";

export const listExercises = listExercisesImpl;

export const saveCustomExercise = saveCustomExerciseImpl;

export const listWorkoutTemplates = listWorkoutTemplatesImpl;

export const listWorkouts = listWorkoutsImpl;

export const getWorkoutDetail = getWorkoutDetailImpl;

export const saveWorkout = saveWorkoutImpl;

export const deleteWorkout = deleteWorkoutImpl;

export const duplicateTemplateToWorkout = duplicateTemplateToWorkoutImpl;

export const listWorkoutSchedule = listWorkoutScheduleImpl;

export const saveWorkoutScheduleDay = saveWorkoutScheduleDayImpl;

export const getWorkoutSessionDetail = getWorkoutSessionDetailImpl;

export const getActiveWorkoutSession = getActiveWorkoutSessionImpl;

export const startWorkoutSession = startWorkoutSessionImpl;

export const upsertExerciseSet = upsertExerciseSetImpl;

export const deleteExerciseSet = deleteExerciseSetImpl;

export const upsertSessionExerciseNote = upsertSessionExerciseNoteImpl;

export const finishWorkoutSession = finishWorkoutSessionImpl;

export const listWorkoutHistory = listWorkoutHistoryImpl;

export const getExerciseHistory = getExerciseHistoryImpl;

export const getExerciseProgress = getExerciseProgressImpl;

export const getExercisePrs = getExercisePrsImpl;

export const getTrainingTodaySummary = async (
  userId: string | null,
  date = new Date(),
  options?: TrainingOptions,
): Promise<TrainingTodaySummary> => {
  const [schedule, activeSession] = await Promise.all([listWorkoutSchedule(userId, options), getActiveWorkoutSession(userId, options)]);
  const scheduled = schedule.find((row) => row.day_of_week === date.getDay()) ?? null;
  return {
    dateKey: getDateKeyForTimezone(date, options?.timeZone || DEFAULT_WATER_TIMEZONE),
    activeSession,
    scheduledWorkout: scheduled?.workout_id ? await getWorkoutDetail(userId, scheduled.workout_id, options) : null,
    schedule,
  };
};

export const getTrainingDayLabel = getTrainingDayLabelImpl;
