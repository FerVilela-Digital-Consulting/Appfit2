export type Range = "7d" | "30d" | "90d" | "all";
export type HydrationState = "dry" | "retention" | "variable";
export type TrainingPerformance = "better" | "same" | "worse";

export type WeightChartPoint = {
  date: string;
  weight: number;
  movingAvg7: number | null;
};

export type NutritionTrendPoint = {
  date: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export type BiofeedbackChartPoint = {
  date: string;
  energy: number | null;
  stress: number | null;
  sleep_quality: number | null;
};

export type BodyFatChartPoint = {
  date: string;
  body_fat_pct: number;
};
