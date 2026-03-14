import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type StatsGoalSummaryCardProps = {
  latestWeight: number | null;
  initialWeight: number | null;
  hasInitialFallback: boolean;
  target: number | null;
  targetDate: string;
  remaining: number | null;
  progress: number | null;
  formatNumber: (value: number | null) => string;
};

export function StatsGoalSummaryCard({
  latestWeight,
  initialWeight,
  hasInitialFallback,
  target,
  targetDate,
  remaining,
  progress,
  formatNumber,
}: StatsGoalSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Resumen de meta de peso
        </CardTitle>
        <CardDescription>Las metas se gestionan en Perfil Fitness.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-6">
          <div>
            <p className="text-muted-foreground">Actual</p>
            <p className="font-semibold">{formatNumber(latestWeight)} kg</p>
          </div>
          <div>
            <p className="text-muted-foreground">Inicial</p>
            <p className="font-semibold">{hasInitialFallback ? "Aun no definido" : `${formatNumber(initialWeight)} kg`}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Objetivo</p>
            <p className="font-semibold">{formatNumber(target)} kg</p>
          </div>
          <div>
            <p className="text-muted-foreground">Fecha objetivo</p>
            <p className="font-semibold">{targetDate}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Restante</p>
            <p className="font-semibold">{remaining === null ? "--" : `${remaining > 0 ? "+" : ""}${remaining.toFixed(1)} kg`}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Progreso</p>
            <p className="font-semibold">{progress === null ? "--" : `${progress.toFixed(0)}%`}</p>
          </div>
        </div>

        {hasInitialFallback ? (
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/today#weight">Registrar peso</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/onboarding">Completar onboarding</Link>
            </Button>
          </div>
        ) : null}

        <Button asChild>
          <Link to="/fitness-profile">{target === null ? "Crear meta" : "Gestionar meta"}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
