import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { HeartPulse } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { DEFAULT_WATER_TIMEZONE } from "@/features/water/waterUtils";
import {
  getBiofeedbackRange,
  getDailyBiofeedback,
  listRecentBiofeedback,
  upsertDailyBiofeedback,
  type DailyBiofeedback,
} from "@/services/dailyBiofeedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";

type BiofeedbackValues = {
  sleep_quality: number;
  hunger_level: number;
  daily_energy: number;
  training_energy: number;
  perceived_stress: number;
  libido: number;
  digestion: number;
};

type BiofeedbackSummaryRange = "7d" | "month" | "all";

const defaultValues = (): BiofeedbackValues => ({
  sleep_quality: 5,
  hunger_level: 5,
  daily_energy: 5,
  training_energy: 5,
  perceived_stress: 5,
  libido: 5,
  digestion: 5,
});

const SUMMARY_RANGE_LABELS: Record<BiofeedbackSummaryRange, string> = {
  "7d": "7D",
  month: "30D",
  all: "Todo",
};

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

const MetricRow = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      <span className="text-sm font-semibold">{value}/10</span>
    </div>
    <Slider min={1} max={10} step={1} value={[value]} onValueChange={(next) => onChange(next[0] ?? value)} />
    <div className="grid grid-cols-10 gap-1">
      {Array.from({ length: 10 }).map((_, idx) => {
        const score = idx + 1;
        return (
          <Button
            key={`${label}-${score}`}
            type="button"
            variant={value === score ? "default" : "outline"}
            size="sm"
            className="px-0"
            onClick={() => onChange(score)}
          >
            {score}
          </Button>
        );
      })}
    </div>
  </div>
);

const SummaryRangeControl = ({
  value,
  onChange,
}: {
  value: BiofeedbackSummaryRange;
  onChange: (value: BiofeedbackSummaryRange) => void;
}) => (
  <div className="relative inline-flex w-full min-w-[11.5rem] max-w-[13.25rem] items-center rounded-xl border border-border/60 bg-muted/10 p-1">
    <motion.span
      aria-hidden
      className="absolute bottom-1 left-1 top-1 rounded-lg bg-primary"
      style={{ width: "calc((100% - 0.5rem) / 3)" }}
      animate={{ x: `${(["7d", "month", "all"] as BiofeedbackSummaryRange[]).findIndex((option) => option === value) * 100}%` }}
      transition={{ type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    />
    {(["7d", "month", "all"] as BiofeedbackSummaryRange[]).map((option) => {
      const isActive = value === option;
      return (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className="relative z-10 flex-1 overflow-hidden rounded-lg px-3 py-1.5 text-xs font-semibold"
        >
          <span className={cn(isActive ? "text-primary-foreground" : "text-muted-foreground")}>{SUMMARY_RANGE_LABELS[option]}</span>
        </button>
      );
    })}
  </div>
);

const DailyBiofeedback = () => {
  const { user, isGuest, profile } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();

  const dateFromQuery = useMemo(() => {
    const value = new URLSearchParams(location.search).get("date");
    return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
  }, [location.search]);

  const [selectedDateKey, setSelectedDateKey] = useState(() => dateFromQuery ?? toDateKey(new Date()));
  const [summaryRange, setSummaryRange] = useState<BiofeedbackSummaryRange>("7d");
  const [values, setValues] = useState<BiofeedbackValues>(() => defaultValues());
  const [notes, setNotes] = useState("");

  const timeZone = profile?.timezone || DEFAULT_WATER_TIMEZONE;
  const selectedDate = useMemo(() => new Date(`${selectedDateKey}T12:00:00`), [selectedDateKey]);
  const summaryRangeDates = useMemo(() => {
    const to = new Date(`${selectedDateKey}T12:00:00`);
    to.setHours(0, 0, 0, 0);
    const from = new Date(to);

    if (summaryRange === "7d") from.setDate(from.getDate() - 6);
    if (summaryRange === "month") from.setDate(1);
    if (summaryRange === "all") from.setFullYear(2020, 0, 1);

    return { from, to };
  }, [selectedDateKey, summaryRange]);

  useEffect(() => {
    if (dateFromQuery && dateFromQuery !== selectedDateKey) {
      setSelectedDateKey(dateFromQuery);
    }
  }, [dateFromQuery, selectedDateKey]);

  const { data: dayData, isLoading } = useQuery({
    queryKey: ["daily_biofeedback", user?.id, selectedDateKey, isGuest, timeZone],
    queryFn: () => getDailyBiofeedback(user?.id ?? null, selectedDate, { isGuest, timeZone }),
    enabled: Boolean(user?.id) || isGuest,
  });

  const { data: summaryRows = [] } = useQuery({
    queryKey: [
      "daily_biofeedback_summary",
      user?.id,
      selectedDateKey,
      summaryRange,
      isGuest,
      timeZone,
      summaryRangeDates.from.toISOString(),
      summaryRangeDates.to.toISOString(),
    ],
    queryFn: () => getBiofeedbackRange(user?.id ?? null, summaryRangeDates.from, summaryRangeDates.to, { isGuest, timeZone }),
    enabled: Boolean(user?.id) || isGuest,
  });

  const { data: recentRows = [] } = useQuery({
    queryKey: ["daily_biofeedback_recent", user?.id, isGuest],
    queryFn: () => listRecentBiofeedback(user?.id ?? null, 7, { isGuest }),
    enabled: Boolean(user?.id) || isGuest,
  });

  useEffect(() => {
    if (!dayData) {
      setValues(defaultValues());
      setNotes("");
      return;
    }
    setValues({
      sleep_quality: dayData.sleep_quality,
      hunger_level: dayData.hunger_level,
      daily_energy: dayData.daily_energy,
      training_energy: dayData.training_energy,
      perceived_stress: dayData.perceived_stress,
      libido: dayData.libido,
      digestion: dayData.digestion,
    });
    setNotes(dayData.notes || "");
  }, [dayData]);

  const summaryMetrics = useMemo(() => {
    const count = summaryRows.length || 1;
    const average = (selector: (row: DailyBiofeedback) => number) =>
      Number((summaryRows.reduce((sum, row) => sum + selector(row), 0) / count).toFixed(1));

    return [
      { key: "daily_energy", label: "Energia diaria", value: average((row) => row.daily_energy), suffix: "/10" },
      { key: "training_energy", label: "Energia entrenando", value: average((row) => row.training_energy), suffix: "/10" },
      { key: "perceived_stress", label: "Estres", value: average((row) => row.perceived_stress), suffix: "/10" },
      { key: "sleep_quality", label: "Calidad de sueno", value: average((row) => row.sleep_quality), suffix: "/10" },
      { key: "hunger_level", label: "Hambre", value: average((row) => row.hunger_level), suffix: "/10" },
      { key: "libido", label: "Libido", value: average((row) => row.libido), suffix: "/10" },
      { key: "digestion", label: "Digestion", value: average((row) => row.digestion), suffix: "/10" },
      { key: "days_logged", label: "Dias con check-in", value: summaryRows.length, suffix: summaryRange === "7d" ? "/7" : "" },
    ];
  }, [summaryRange, summaryRows]);

  const saveMutation = useMutation({
    mutationFn: async () =>
      upsertDailyBiofeedback({
        userId: user?.id ?? null,
        date: selectedDate,
        isGuest,
        timeZone,
        notes: notes.trim() || null,
        ...values,
      }),
    onSuccess: async () => {
      toast.success("Check-in guardado.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["daily_biofeedback"] }),
        queryClient.invalidateQueries({ queryKey: ["daily_biofeedback_summary"] }),
        queryClient.invalidateQueries({ queryKey: ["daily_biofeedback_recent"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["calendar_data"] }),
        queryClient.invalidateQueries({ queryKey: ["calendar_day_biofeedback"] }),
        queryClient.invalidateQueries({ queryKey: ["weekly_review_summary"] }),
      ]);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "No se pudo guardar el check-in."));
    },
  });

  return (
    <div className="container max-w-5xl space-y-5 py-6 md:space-y-6 md:py-8">
      <div className="flex items-center gap-3">
        <HeartPulse className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Daily Biofeedback Check-in</h1>
          <p className="text-sm text-muted-foreground">Escala subjetiva 1-10 para estado fisiologico diario.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Resumen fisiologico</CardTitle>
            <CardDescription>Promedio por indicador segun el rango seleccionado.</CardDescription>
          </div>
          <SummaryRangeControl value={summaryRange} onChange={setSummaryRange} />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
            {summaryMetrics.map((metric) => (
              <div key={metric.key} className="rounded-xl border border-border/60 bg-background/40 p-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{metric.label}</p>
                <p className="mt-2 text-xl font-semibold">
                  {metric.value}
                  {metric.suffix}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.8fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Check-in diario</CardTitle>
            <CardDescription>Completa en menos de 1 minuto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="biofeedback-date">Fecha</Label>
              <Input
                id="biofeedback-date"
                type="date"
                value={selectedDateKey}
                onChange={(e) => setSelectedDateKey(e.target.value)}
              />
            </div>

            <MetricRow
              label="Calidad de sueno"
              value={values.sleep_quality}
              onChange={(next) => setValues((prev) => ({ ...prev, sleep_quality: next }))}
            />
            <MetricRow
              label="Nivel de hambre"
              value={values.hunger_level}
              onChange={(next) => setValues((prev) => ({ ...prev, hunger_level: next }))}
            />
            <MetricRow
              label="Energia diaria"
              value={values.daily_energy}
              onChange={(next) => setValues((prev) => ({ ...prev, daily_energy: next }))}
            />
            <MetricRow
              label="Energia en entrenamiento"
              value={values.training_energy}
              onChange={(next) => setValues((prev) => ({ ...prev, training_energy: next }))}
            />
            <MetricRow
              label="Estres percibido"
              value={values.perceived_stress}
              onChange={(next) => setValues((prev) => ({ ...prev, perceived_stress: next }))}
            />
            <MetricRow
              label="Libido"
              value={values.libido}
              onChange={(next) => setValues((prev) => ({ ...prev, libido: next }))}
            />
            <MetricRow
              label="Digestion"
              value={values.digestion}
              onChange={(next) => setValues((prev) => ({ ...prev, digestion: next }))}
            />

            <div className="space-y-2">
              <Label htmlFor="biofeedback-notes">Notas (opcional)</Label>
              <Textarea
                id="biofeedback-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Sensaciones, molestias, contexto..."
              />
            </div>

            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || isLoading}>
              Guardar check-in
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ultimos check-ins</CardTitle>
            <CardDescription>Historial rapido</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin registros aun.</p>
            ) : (
              recentRows.map((row) => (
                <div key={row.id} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">{row.date_key}</p>
                  <p className="text-muted-foreground">
                    Energia {row.daily_energy}/10 | Estres {row.perceived_stress}/10 | Sueno {row.sleep_quality}/10
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DailyBiofeedback;
