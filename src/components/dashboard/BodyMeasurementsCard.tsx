import { Link } from "react-router-dom";

import { BodyMannequin, type MeasurementPoint } from "@/components/body/BodyMannequin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BodyMeasurement } from "@/services/bodyMeasurements";

type Props = {
  loading?: boolean;
  latest: BodyMeasurement | null;
  previous: BodyMeasurement | null;
};

const metricDelta = (latest?: number | null, previous?: number | null) => {
  if (latest === null || latest === undefined || previous === null || previous === undefined) return null;
  return Number((latest - previous).toFixed(1));
};

const formatDelta = (value: number | null) => {
  if (value === null) return undefined;
  return `${value > 0 ? "+" : ""}${value.toFixed(1)} cm`;
};

const measurementTone = (key: "neck" | "arm" | "waist" | "hip" | "thigh", delta: number | null): MeasurementPoint["tone"] => {
  if (delta === null || delta === 0) return "neutral";
  if (key === "waist") return delta < 0 ? "positive" : "negative";
  return delta < 0 ? "negative" : "positive";
};

const BodyMeasurementsCard = ({ loading = false, latest, previous }: Props) => {
  if (loading) {
    return (
      <Card className="rounded-2xl border-border/60 bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle>Body Composition & Measurements</CardTitle>
          <CardDescription>Visualizacion corporal y variacion de medidas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-72 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!latest) {
    return (
      <Card className="rounded-2xl border-border/60 bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle>Body Composition & Measurements</CardTitle>
          <CardDescription>Sin medicion corporal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Registra cuello, cintura, cadera, brazo y muslo para ver el maniqui interactivo.</p>
          <Button asChild>
            <Link to="/measurements">Registrar medidas</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const neckDelta = metricDelta(latest.neck_cm, previous?.neck_cm ?? null);
  const waistDelta = metricDelta(latest.waist_cm, previous?.waist_cm ?? null);
  const hipDelta = metricDelta(latest.hip_cm, previous?.hip_cm ?? null);
  const armDelta = metricDelta(latest.arm_cm, previous?.arm_cm ?? null);
  const thighDelta = metricDelta(latest.thigh_cm, previous?.thigh_cm ?? null);

  const points: MeasurementPoint[] = [
    {
      key: "neck",
      label: "Cuello",
      valueText: `${latest.neck_cm.toFixed(1)} cm`,
      deltaText: formatDelta(neckDelta),
      x: 50,
      y: 22,
      tone: measurementTone("neck", neckDelta),
    },
    {
      key: "arm",
      label: "Brazo",
      valueText: latest.arm_cm ? `${Number(latest.arm_cm).toFixed(1)} cm` : "--",
      deltaText: formatDelta(armDelta),
      x: 25,
      y: 40,
      tone: measurementTone("arm", armDelta),
    },
    {
      key: "waist",
      label: "Cintura",
      valueText: `${latest.waist_cm.toFixed(1)} cm`,
      deltaText: formatDelta(waistDelta),
      x: 50,
      y: 58,
      tone: measurementTone("waist", waistDelta),
    },
    {
      key: "hip",
      label: "Cadera",
      valueText: latest.hip_cm ? `${Number(latest.hip_cm).toFixed(1)} cm` : "--",
      deltaText: formatDelta(hipDelta),
      x: 50,
      y: 70,
      tone: measurementTone("hip", hipDelta),
    },
    {
      key: "thigh",
      label: "Muslo",
      valueText: latest.thigh_cm ? `${Number(latest.thigh_cm).toFixed(1)} cm` : "--",
      deltaText: formatDelta(thighDelta),
      x: 43,
      y: 84,
      tone: measurementTone("thigh", thighDelta),
    },
  ];

  return (
    <Card className="rounded-2xl border-border/60 bg-card/80 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle>Body Composition & Measurements</CardTitle>
          <CardDescription>Ultima medicion: {latest.date_key}</CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/measurements">Editar medidas</Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:justify-between">
        <BodyMannequin points={points} />
        <div className="w-full space-y-2 lg:max-w-xs">
          <div className="rounded-lg border border-border/60 p-3">
            <p className="text-xs text-muted-foreground">% Grasa</p>
            <p className="text-lg font-semibold">
              {latest.body_fat_pct !== null && latest.body_fat_pct !== undefined ? `${Number(latest.body_fat_pct).toFixed(1)}%` : "--"}
            </p>
          </div>
          <div className="rounded-lg border border-border/60 p-3">
            <p className="text-xs text-muted-foreground">Masa grasa / magra</p>
            <p className="text-sm font-medium">
              {latest.fat_mass_kg !== null && latest.fat_mass_kg !== undefined ? `${Number(latest.fat_mass_kg).toFixed(1)} kg` : "--"} /{" "}
              {latest.lean_mass_kg !== null && latest.lean_mass_kg !== undefined ? `${Number(latest.lean_mass_kg).toFixed(1)} kg` : "--"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BodyMeasurementsCard;
