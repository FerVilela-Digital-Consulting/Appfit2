import { NutritionActivityLevel, NutritionGoalType } from "@/types/nutrition";

export type ActivityOption = {
  value: NutritionActivityLevel;
  label: string;
  description: string;
};

export type GoalOption = {
  value: NutritionGoalType;
  label: string;
  description: string;
  legacyGoalTypeLabel: string;
};

export const ACTIVITY_OPTIONS: ActivityOption[] = [
  {
    value: "low",
    label: "Bajo",
    description: "Vida sedentaria o poco ejercicio.",
  },
  {
    value: "moderate",
    label: "Moderado",
    description: "Ejercicio ligero 1 a 3 días por semana.",
  },
  {
    value: "high",
    label: "Alto",
    description: "Entrenamiento intenso 3 a 5 días por semana.",
  },
  {
    value: "very_high",
    label: "Muy alto",
    description: "Entrenamiento diario con NEAT elevado.",
  },
  {
    value: "hyperactive",
    label: "Hiperactivo",
    description: "Trabajo físico extremo o actividad atlética profesional.",
  },
];

export const GOAL_OPTIONS: GoalOption[] = [
  {
    value: "lose",
    label: "Perder peso",
    description: "Déficit agresivo para bajar peso más rápido.",
    legacyGoalTypeLabel: "Lose Weight",
  },
  {
    value: "lose_slow",
    label: "Perder peso lentamente",
    description: "Déficit moderado para una reducción más gradual.",
    legacyGoalTypeLabel: "Lose Weight Slowly",
  },
  {
    value: "maintain",
    label: "Mantener peso",
    description: "Calorías de mantenimiento para sostener el peso actual.",
    legacyGoalTypeLabel: "Maintain Weight",
  },
  {
    value: "gain_slow",
    label: "Aumentar peso lentamente",
    description: "Superávit moderado para subir de forma controlada.",
    legacyGoalTypeLabel: "Gain Weight Slowly",
  },
  {
    value: "gain",
    label: "Aumentar peso",
    description: "Superávit alto para subir peso más rápido.",
    legacyGoalTypeLabel: "Gain Weight",
  },
];

export const findGoalOption = (value: string | null | undefined) =>
  GOAL_OPTIONS.find((option) => option.value === value) ?? GOAL_OPTIONS[2];

export const findActivityOption = (value: string | null | undefined) =>
  ACTIVITY_OPTIONS.find((option) => option.value === value) ?? ACTIVITY_OPTIONS[1];

