import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type StatsSummaryCardsProps = {
  latestWeight: number | null;
  delta7: number | null;
  movingAvg7: number | null | undefined;
  trendLabel: string;
  sleepGoalHours: string;
  sleepWeekAvgHours: string;
  sleepMonthAvgHours: string;
  sleepWeekMet: number;
  nutrition7dCalories: number;
  nutrition7dProtein: number;
  nutrition30dCarbs: number;
  nutrition30dFat: number;
  nutritionGoalCalories: number;
  nutritionGoalProtein: number;
  nutritionGoalCarbs: number;
  nutritionGoalFat: number;
  biofeedbackWeek: {
    avg_energy?: number | null;
    avg_stress?: number | null;
    avg_sleep_quality?: number | null;
    days_logged?: number | null;
  } | null | undefined;
  latestMeasurement: {
    body_fat_pct?: number | null;
    fat_mass_kg?: number | null;
    lean_mass_kg?: number | null;
  } | null | undefined;
  weeklyReview: {
    waterDaysMet?: number | null;
    waterDaysTotal?: number | null;
    activeDays?: number | null;
    weightTrend?: "up" | "down" | "stable" | null;
    weightWeeklyChange?: number | null;
  } | null | undefined;
  delta30: number | null;
  weeklyAvg: number | null;
  prevMovingAvg7: number | null | undefined;
  formatNumber: (value: number | null) => string;
  trendLabelForValue: (value: "up" | "down" | "stable" | null) => string;
};

export function StatsSummaryCards({
  latestWeight,
  delta7,
  movingAvg7,
  trendLabel,
  sleepGoalHours,
  sleepWeekAvgHours,
  sleepMonthAvgHours,
  sleepWeekMet,
  nutrition7dCalories,
  nutrition7dProtein,
  nutrition30dCarbs,
  nutrition30dFat,
  nutritionGoalCalories,
  nutritionGoalProtein,
  nutritionGoalCarbs,
  nutritionGoalFat,
  biofeedbackWeek,
  latestMeasurement,
  weeklyReview,
  delta30,
  weeklyAvg,
  prevMovingAvg7,
  formatNumber,
  trendLabelForValue,
}: StatsSummaryCardsProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Peso mas reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatNumber(latestWeight)} kg</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cambio vs 7d</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{delta7 === null ? "--" : `${delta7 > 0 ? "+" : ""}${delta7.toFixed(1)} kg`}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Promedio movil 7d</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{movingAvg7 === null || movingAvg7 === undefined ? "--" : `${movingAvg7.toFixed(2)} kg`}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tendencia</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{trendLabel}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de sueno</CardTitle>
          <CardDescription>Meta y tendencias desde registros de sueno.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Meta</p>
            <p className="text-xl font-semibold">{sleepGoalHours} h</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Promedio (7d)</p>
            <p className="text-xl font-semibold">{sleepWeekAvgHours} h</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Promedio (30d)</p>
            <p className="text-xl font-semibold">{sleepMonthAvgHours} h</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Dias cumplidos</p>
            <p className="text-xl font-semibold">{sleepWeekMet}/7</p>
          </div>
          <div className="md:col-span-4">
            <Button asChild variant="outline">
              <Link to="/today#sleep">Sueno</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de alimentacion</CardTitle>
          <CardDescription>Calorias y macros promedio en 7 y 30 dias.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Calorias (7d)</p>
            <p className="text-xl font-semibold">{nutrition7dCalories} kcal</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Proteina (7d)</p>
            <p className="text-xl font-semibold">{nutrition7dProtein} g</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Carbs (30d)</p>
            <p className="text-xl font-semibold">{nutrition30dCarbs} g</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Grasas (30d)</p>
            <p className="text-xl font-semibold">{nutrition30dFat} g</p>
          </div>
          <div className="md:col-span-4 text-xs text-muted-foreground">
            Objetivos: {nutritionGoalCalories} kcal | P {nutritionGoalProtein}g | C {nutritionGoalCarbs}g | G {nutritionGoalFat}g
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Biofeedback semanal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-semibold">Energia: {biofeedbackWeek?.avg_energy ?? 0}/10</p>
            <p className="font-semibold">Estres: {biofeedbackWeek?.avg_stress ?? 0}/10</p>
            <p className="font-semibold">Calidad de sueno: {biofeedbackWeek?.avg_sleep_quality ?? 0}/10</p>
            <p className="text-xs text-muted-foreground">Dias registrados: {biofeedbackWeek?.days_logged ?? 0}/7</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/today#biofeedback">Abrir biofeedback</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Composicion corporal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-semibold">
              Grasa corporal: {latestMeasurement?.body_fat_pct === null || latestMeasurement?.body_fat_pct === undefined ? "--" : `${Number(latestMeasurement.body_fat_pct).toFixed(1)}%`}
            </p>
            <p className="font-semibold">
              Masa grasa: {latestMeasurement?.fat_mass_kg === null || latestMeasurement?.fat_mass_kg === undefined ? "--" : `${Number(latestMeasurement.fat_mass_kg).toFixed(1)} kg`}
            </p>
            <p className="font-semibold">
              Masa magra: {latestMeasurement?.lean_mass_kg === null || latestMeasurement?.lean_mass_kg === undefined ? "--" : `${Number(latestMeasurement.lean_mass_kg).toFixed(1)} kg`}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/body">Abrir medidas</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Revision semanal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-semibold">Adherencia agua: {weeklyReview?.waterDaysMet ?? 0}/{weeklyReview?.waterDaysTotal ?? 7}</p>
            <p className="font-semibold">Dias activos: {weeklyReview?.activeDays ?? 0}/7</p>
            <p className="font-semibold">Tendencia de peso: {trendLabelForValue(weeklyReview?.weightTrend ?? null)}</p>
            <p className="text-xs text-muted-foreground">
              Cambio semanal: {weeklyReview?.weightWeeklyChange === null || weeklyReview?.weightWeeklyChange === undefined ? "--" : `${weeklyReview.weightWeeklyChange > 0 ? "+" : ""}${weeklyReview.weightWeeklyChange.toFixed(2)} kg`}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cambio vs 30d</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{delta30 === null ? "--" : `${delta30 > 0 ? "+" : ""}${delta30.toFixed(1)} kg`}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Promedio semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{weeklyAvg === null ? "--" : `${weeklyAvg.toFixed(1)} kg`}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Promedio movil previo 7d</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{prevMovingAvg7 === null || prevMovingAvg7 === undefined ? "--" : `${prevMovingAvg7.toFixed(2)} kg`}</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
