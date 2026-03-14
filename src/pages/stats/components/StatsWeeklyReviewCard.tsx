import { ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { HydrationState, TrainingPerformance } from "@/pages/stats/types";

type StatsWeeklyReviewCardProps = {
  weeklyReview: {
    waterDaysMet?: number | null;
    waterDaysTotal?: number | null;
    avgSleepMinutes?: number | null;
    activeDays?: number | null;
    weightWeeklyChange?: number | null;
  } | null | undefined;
  hydrationState: HydrationState;
  onHydrationStateChange: (value: HydrationState) => void;
  trainingPerformance: TrainingPerformance;
  onTrainingPerformanceChange: (value: TrainingPerformance) => void;
  weeklyNotes: string;
  onWeeklyNotesChange: (value: string) => void;
  isPending: boolean;
  onSave: () => void;
};

export function StatsWeeklyReviewCard({
  weeklyReview,
  hydrationState,
  onHydrationStateChange,
  trainingPerformance,
  onTrainingPerformanceChange,
  weeklyNotes,
  onWeeklyNotesChange,
  isPending,
  onSave,
}: StatsWeeklyReviewCardProps) {
  return (
    <Card id="weekly-review">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Revision semanal
        </CardTitle>
        <CardDescription>Observaciones cualitativas para contextualizar las tendencias de la semana.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Adherencia agua</p>
            <p className="text-2xl font-semibold">{weeklyReview?.waterDaysMet ?? 0}/{weeklyReview?.waterDaysTotal ?? 7}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Sueno promedio</p>
            <p className="text-2xl font-semibold">{weeklyReview ? ((weeklyReview.avgSleepMinutes ?? 0) / 60).toFixed(1) : "0.0"} h</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Dias activos</p>
            <p className="text-2xl font-semibold">{weeklyReview?.activeDays ?? 0}/7</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Peso semanal</p>
            <p className="text-2xl font-semibold">
              {weeklyReview?.weightWeeklyChange === null || weeklyReview?.weightWeeklyChange === undefined
                ? "--"
                : `${weeklyReview.weightWeeklyChange > 0 ? "+" : ""}${weeklyReview.weightWeeklyChange.toFixed(2)} kg`}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="hydration-state">Estado hidrico</Label>
            <select
              id="hydration-state"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={hydrationState}
              onChange={(event) => onHydrationStateChange(event.target.value as HydrationState)}
            >
              <option value="dry">Seco</option>
              <option value="retention">Retencion</option>
              <option value="variable">Variable</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="training-performance">Rendimiento entrenamiento</Label>
            <select
              id="training-performance"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={trainingPerformance}
              onChange={(event) => onTrainingPerformanceChange(event.target.value as TrainingPerformance)}
            >
              <option value="better">Mejor</option>
              <option value="same">Igual</option>
              <option value="worse">Peor</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="weekly-notes">Notas de la semana</Label>
          <Textarea
            id="weekly-notes"
            value={weeklyNotes}
            onChange={(event) => onWeeklyNotesChange(event.target.value)}
            placeholder="Factores que explican el rendimiento, adherencia o recuperacion de esta semana..."
          />
        </div>

        <Button onClick={onSave} disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar revision semanal"}
        </Button>
      </CardContent>
    </Card>
  );
}
