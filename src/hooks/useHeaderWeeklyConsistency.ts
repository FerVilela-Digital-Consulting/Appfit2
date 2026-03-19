import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, startOfWeek } from "date-fns";

import { useAuth } from "@/context/AuthContext";
import { buildWeeklyConsistency } from "@/features/dashboard/dashboardViewModel";
import { DEFAULT_WATER_TIMEZONE, getDateKeyForTimezone } from "@/features/water/waterUtils";
import { listBodyMetricsBetween } from "@/services/bodyMetrics";
import { getBiofeedbackRange } from "@/services/dailyBiofeedback";
import { getNutritionRangeSummary } from "@/services/nutrition";
import { getSleepRangeTotals } from "@/services/sleep";
import { getWaterRangeTotals } from "@/services/waterIntake";

const formatDateKey = (date: Date) => format(date, "yyyy-MM-dd");

type WeeklyActivityDay = {
  hasWater: boolean;
  hasSleep: boolean;
  hasWeight: boolean;
  hasBiofeedback: boolean;
  hasNutrition: boolean;
};

export const useHeaderWeeklyConsistency = () => {
  const { user, isGuest, profile } = useAuth();
  const userId = user?.id ?? null;
  const timeZone = profile?.timezone || DEFAULT_WATER_TIMEZONE;
  const today = useMemo(() => new Date(), []);
  const todayKey = getDateKeyForTimezone(today, timeZone);
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);

  const weeklyActivityQuery = useQuery({
    queryKey: [
      "header_weekly_consistency",
      userId,
      isGuest,
      timeZone,
      formatDateKey(weekStart),
      formatDateKey(weekEnd),
    ],
    queryFn: async () => {
      const [waterTotals, sleepTotals, bioRows, nutritionRange, weightRows] = await Promise.all([
        getWaterRangeTotals(userId, weekStart, weekEnd, { isGuest, timeZone }),
        getSleepRangeTotals(userId, weekStart, weekEnd, { isGuest, timeZone }),
        getBiofeedbackRange(userId, weekStart, weekEnd, { isGuest, timeZone }),
        getNutritionRangeSummary(userId, weekStart, weekEnd, { isGuest, timeZone }).catch(() => ({ days: [] })),
        listBodyMetricsBetween(userId, weekStart, weekEnd, isGuest),
      ]);

      const waterMap = new Map(waterTotals.map((row) => [row.date_key, Number(row.total_ml || 0) > 0]));
      const sleepMap = new Map(sleepTotals.map((row) => [row.date_key, Number(row.total_minutes || 0) > 0]));
      const bioMap = new Map(bioRows.map((row) => [row.date_key, true]));
      const nutritionMap = new Map((nutritionRange.days ?? []).map((row) => [row.date_key, Number(row.calories || 0) > 0]));
      const weightMap = new Map(weightRows.map((row) => [row.measured_at, true]));

      const days = new Map<string, WeeklyActivityDay>();
      for (let index = 0; index < 7; index += 1) {
        const date = addDays(weekStart, index);
        const dateKey = formatDateKey(date);
        days.set(dateKey, {
          hasWater: waterMap.get(dateKey) ?? false,
          hasSleep: sleepMap.get(dateKey) ?? false,
          hasWeight: weightMap.get(dateKey) ?? false,
          hasBiofeedback: bioMap.get(dateKey) ?? false,
          hasNutrition: nutritionMap.get(dateKey) ?? false,
        });
      }

      return days;
    },
    enabled: Boolean(userId) || isGuest,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  return {
    weeklyConsistency: buildWeeklyConsistency(weeklyActivityQuery.data, todayKey),
    isLoading: weeklyActivityQuery.isLoading,
    error: weeklyActivityQuery.error,
  };
};

