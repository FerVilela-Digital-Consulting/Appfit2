import type { ExerciseRecord, SaveWorkoutInput } from "@/modules/training/types";

export type WorkoutExerciseDraft = SaveWorkoutInput["exercises"][number] & {
  clientId: string;
  exercise?: ExerciseRecord;
};

export type SetDraft = {
  weight: string;
  reps: string;
  rir: string;
  notes: string;
  completed: boolean;
};
