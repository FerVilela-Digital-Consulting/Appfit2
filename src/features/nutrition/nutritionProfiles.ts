import { NutritionDayArchetype } from "@/types/nutrition";

export const NUTRITION_ARCHETYPE_META: Record<
  NutritionDayArchetype,
  {
    label: string;
    shortLabel: string;
    description: string;
    calorieAdjustment: number;
    fatMultiplier: number;
  }
> = {
  base: {
    label: "Base",
    shortLabel: "Base",
    description: "Dia de entrenamiento normal. Usa el TDEE sin ajuste extra.",
    calorieAdjustment: 0,
    fatMultiplier: 1,
  },
  heavy: {
    label: "Heavy",
    shortLabel: "Heavy",
    description: "Dia de alta demanda. Agrega 150 kcal y prioriza carbohidratos.",
    calorieAdjustment: 150,
    fatMultiplier: 1,
  },
  recovery: {
    label: "Recovery",
    shortLabel: "Recovery",
    description: "Dia de descanso. Resta 300 kcal y sube grasa a 1.2 g/kg.",
    calorieAdjustment: -300,
    fatMultiplier: 1.2,
  },
};

export const getArchetypeLabel = (value: NutritionDayArchetype | null | undefined) =>
  value ? NUTRITION_ARCHETYPE_META[value].label : "--";
