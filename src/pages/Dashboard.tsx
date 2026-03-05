import { Link } from "react-router-dom";

import { useDashboardData } from "@/hooks/useDashboardData";
import WeightCard from "@/components/dashboard/WeightCard";
import GoalCard from "@/components/dashboard/GoalCard";
import WaterCard from "@/components/dashboard/WaterCard";
import SleepCard from "@/components/dashboard/SleepCard";
import WeeklySummaryCard from "@/components/dashboard/WeeklySummaryCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const data = useDashboardData();

  const goalHeadline = data.goal.progress === null ? "--" : `${data.goal.progress.toFixed(0)}%`;
  const waterHeadline = `${(data.water.todayMl / 1000).toFixed(1)} / ${(data.water.goalMl / 1000).toFixed(1)} L`;
  const sleepHeadline = `${(data.sleep.todayMinutes / 60).toFixed(1)} / ${(data.sleep.goalMinutes / 60).toFixed(1)} h`;
  const biofeedbackHeadline = data.biofeedback.today
    ? `Energia ${data.biofeedback.today.daily_energy}/10 | Estres ${data.biofeedback.today.perceived_stress}/10`
    : "Sin check-in hoy";
  const compositionHeadline =
    data.bodyComposition.latest?.body_fat_pct !== null && data.bodyComposition.latest?.body_fat_pct !== undefined
      ? `${Number(data.bodyComposition.latest.body_fat_pct).toFixed(1)}% grasa`
      : "Sin medicion corporal";

  return (
    <div className="space-y-6 py-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Hola, {data.displayName}</CardTitle>
          <CardDescription>{data.todayLabel}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Estado de meta</p>
            <p className="text-xl font-semibold">Vas {goalHeadline} hacia tu meta</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Agua hoy</p>
            <p className="text-xl font-semibold">{waterHeadline}</p>
            <p className="text-xs text-muted-foreground">
              {data.water.todayMl} ml / {data.water.goalMl} ml
            </p>
          </div>
          <div className="rounded-lg border p-4 md:col-span-2">
            <p className="text-xs text-muted-foreground">Sueno hoy</p>
            <p className="text-xl font-semibold">{sleepHeadline}</p>
            <p className="text-xs text-muted-foreground">
              {data.sleep.todayMinutes} min / {data.sleep.goalMinutes} min
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Biofeedback diario</p>
            <p className="text-lg font-semibold">{biofeedbackHeadline}</p>
            <p className="text-xs text-muted-foreground">
              Promedios 7d: Energia {data.biofeedback.weekAverages.avg_energy}/10 | Estres {data.biofeedback.weekAverages.avg_stress}/10
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Composicion corporal</p>
            <p className="text-lg font-semibold">{compositionHeadline}</p>
            <p className="text-xs text-muted-foreground">
              Masa grasa:{" "}
              {data.bodyComposition.latest?.fat_mass_kg !== null && data.bodyComposition.latest?.fat_mass_kg !== undefined
                ? `${Number(data.bodyComposition.latest.fat_mass_kg).toFixed(1)} kg`
                : "--"}{" "}
              | Masa magra:{" "}
              {data.bodyComposition.latest?.lean_mass_kg !== null && data.bodyComposition.latest?.lean_mass_kg !== undefined
                ? `${Number(data.bodyComposition.latest.lean_mass_kg).toFixed(1)} kg`
                : "--"}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <WeightCard
          latest={data.weight.latest}
          initial={data.weight.initial}
          initialDate={data.weight.initialDate}
          weeklyDelta={data.weight.weeklyDelta}
          movingAvg7={data.weight.movingAvg7}
          trend={data.weight.trend}
          loading={data.weight.loading}
          error={data.weight.error}
        />
        <GoalCard
          target={data.goal.target}
          progress={data.goal.progress}
          remainingKg={data.goal.remainingKg}
          loading={data.goal.loading}
          error={data.goal.error}
        />
        <WaterCard showHistoryButton />
        <SleepCard />
        <WeeklySummaryCard
          waterAverageMl={data.water.weekAverageMl}
          waterMonthAverageMl={data.water.monthAverageMl}
          waterDaysMet={data.water.weekDaysMet}
          waterDaysTotal={data.water.weekDaysTotal}
          sleepAverageMinutes={data.sleep.weekAverageMinutes}
          sleepMonthAverageMinutes={data.sleep.monthAverageMinutes}
          sleepDaysMet={data.sleep.weekDaysMet}
          sleepDaysTotal={data.sleep.weekDaysTotal}
          weightTrend={data.weight.trend}
          bioEnergy={data.biofeedback.weekAverages.avg_energy}
          bioStress={data.biofeedback.weekAverages.avg_stress}
          bioSleep={data.biofeedback.weekAverages.avg_sleep_quality}
          activeDays={data.weeklyReview.summary?.activeDays ?? 0}
          weeklyReviewHref="/weekly-review"
          loading={data.water.loading || data.sleep.loading || data.biofeedback.loading || data.weeklyReview.loading}
          error={data.water.error || data.sleep.error || data.biofeedback.error || data.weeklyReview.error}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividad reciente</CardTitle>
          <CardDescription>Ultimos registros relevantes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Ultimo peso</p>
            {data.weight.latestEntry ? (
              <p className="font-medium">
                {Number(data.weight.latestEntry.weight_kg).toFixed(1)} kg ({data.weight.latestEntry.measured_at})
              </p>
            ) : (
              <p className="font-medium">Sin registros</p>
            )}
          </div>

          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Ultimos consumos de agua</p>
            {data.water.recentLogs.length === 0 ? (
              <p className="font-medium">Sin registros</p>
            ) : (
              <div className="space-y-1">
                {data.water.recentLogs.slice(0, 3).map((log) => (
                  <p key={log.id} className="font-medium">
                    {log.consumed_ml} ml - {new Date(log.logged_at).toLocaleString()}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Ultimos registros de sueno</p>
            {data.sleep.recentLogs.length === 0 ? (
              <p className="font-medium">Sin registros</p>
            ) : (
              <div className="space-y-1">
                {data.sleep.recentLogs.slice(0, 3).map((log) => (
                  <p key={log.id} className="font-medium">
                    {(log.total_minutes / 60).toFixed(1)} h - {log.date_key}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Ultimos biofeedbacks</p>
            {data.biofeedback.recentLogs.length === 0 ? (
              <p className="font-medium">Sin registros</p>
            ) : (
              <div className="space-y-1">
                {data.biofeedback.recentLogs.slice(0, 3).map((log) => (
                  <p key={log.id} className="font-medium">
                    {log.date_key}: E {log.daily_energy}/10 | S {log.perceived_stress}/10 | SQ {log.sleep_quality}/10
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/statistics">Ver historial peso</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/water">Ver historial agua</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/sleep">Ver historial sueno</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/biofeedback">Biofeedback</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/measurements">Medidas corporales</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/weekly-review">Weekly review</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
