import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Moon, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { usePreferences } from "@/context/PreferencesContext";
import { DEFAULT_WATER_TIMEZONE } from "@/features/water/waterUtils";
import {
  addSleepLog,
  clearSleepLogsByDate,
  deleteSleepLog,
  getSleepDay,
  getSleepGoal,
  getSleepRangeTotals,
  updateSleepGoal,
} from "@/services/sleep";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/errors";

type Range = "7d" | "30d" | "month";

type SleepWorkspaceProps = {
  embedded?: boolean;
};

const SleepWorkspace = ({ embedded = false }: SleepWorkspaceProps) => {
  const { user, isGuest, profile } = useAuth();
  const { t } = usePreferences();
  const queryClient = useQueryClient();

  const [range, setRange] = useState<Range>("7d");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [quality, setQuality] = useState("");
  const [notes, setNotes] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [sleepStart, setSleepStart] = useState("");
  const [sleepEnd, setSleepEnd] = useState("");
  const [goalHours, setGoalHours] = useState("8");

  const timeZone = profile?.timezone || DEFAULT_WATER_TIMEZONE;

  const rangeDates = useMemo(() => {
    const to = new Date();
    to.setHours(0, 0, 0, 0);
    const from = new Date(to);
    if (range === "7d") from.setDate(from.getDate() - 6);
    if (range === "30d") from.setDate(from.getDate() - 29);
    if (range === "month") from.setDate(1);
    return { from, to };
  }, [range]);

  const { data: goalData = { sleep_goal_minutes: 480 } } = useQuery({
    queryKey: ["sleep_goal", user?.id],
    queryFn: () => getSleepGoal(user?.id ?? null, { isGuest }),
    enabled: Boolean(user?.id) || isGuest,
  });
  const { data: rangeTotals = [] } = useQuery({
    queryKey: ["sleep_range", user?.id, range, rangeDates.from.toISOString(), rangeDates.to.toISOString(), isGuest],
    queryFn: () => getSleepRangeTotals(user?.id ?? null, rangeDates.from, rangeDates.to, { isGuest, timeZone }),
    enabled: Boolean(user?.id) || isGuest,
  });
  const { data: dayData } = useQuery({
    queryKey: ["sleep_day", user?.id, selectedDate.toISOString().slice(0, 10)],
    queryFn: () => getSleepDay(user?.id ?? null, selectedDate, { isGuest, timeZone }),
    enabled: Boolean(user?.id) || isGuest,
  });

  const avgMinutes = rangeTotals.length
    ? Math.round(rangeTotals.reduce((sum, row) => sum + row.total_minutes, 0) / rangeTotals.length)
    : 0;
  const daysMet = rangeTotals.filter((row) => row.total_minutes >= goalData.sleep_goal_minutes).length;

  const chartData = rangeTotals.map((row) => ({
    date: row.date_key,
    hours: Number((row.total_minutes / 60).toFixed(2)),
    total_minutes: row.total_minutes,
  }));

  useEffect(() => {
    setGoalHours(String(Math.round((goalData.sleep_goal_minutes ?? 480) / 60)));
  }, [goalData.sleep_goal_minutes]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const h = Number(hours || 0);
      const m = Number(minutes || 0);
      const total = h * 60 + m;
      await addSleepLog({
        userId: user?.id ?? null,
        date: selectedDate,
        total_minutes: total,
        quality: quality ? Number(quality) : null,
        notes: notes.trim() || null,
        start: sleepStart || null,
        end: sleepEnd || null,
        isGuest,
        timeZone,
      });
    },
    onSuccess: async () => {
      toast.success(t("sleep.page.saved"));
      setHours("");
      setMinutes("");
      setQuality("");
      setNotes("");
      setSleepStart("");
      setSleepEnd("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sleep_day"] }),
        queryClient.invalidateQueries({ queryKey: ["sleep_range"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard_snapshot"] }),
        queryClient.invalidateQueries({ queryKey: ["header_weekly_consistency"] }),
        queryClient.invalidateQueries({ queryKey: ["calendar_data"] }),
      ]);
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, t("sleep.page.saveError"))),
  });

  const goalMutation = useMutation({
    mutationFn: async () => {
      const parsedHours = Number(goalHours || 0);
      const goalMinutes = Math.round(parsedHours * 60);
      await updateSleepGoal(user?.id ?? null, goalMinutes, { isGuest });
    },
    onSuccess: async () => {
      toast.success("Meta diaria de sueno actualizada.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sleep_goal"] }),
        queryClient.invalidateQueries({ queryKey: ["sleep_range"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard_snapshot"] }),
      ]);
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "No se pudo actualizar la meta de sueno.")),
  });

  const undoMutation = useMutation({
    mutationFn: (id: string) => deleteSleepLog(id, user?.id ?? null, { isGuest }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sleep_day"] }),
        queryClient.invalidateQueries({ queryKey: ["sleep_range"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard_snapshot"] }),
        queryClient.invalidateQueries({ queryKey: ["header_weekly_consistency"] }),
        queryClient.invalidateQueries({ queryKey: ["calendar_data"] }),
      ]);
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "No se pudo deshacer el ultimo registro.")),
  });

  const resetDayMutation = useMutation({
    mutationFn: () => clearSleepLogsByDate(user?.id ?? null, selectedDate, { isGuest, timeZone }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sleep_day"] }),
        queryClient.invalidateQueries({ queryKey: ["sleep_range"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard_snapshot"] }),
        queryClient.invalidateQueries({ queryKey: ["header_weekly_consistency"] }),
        queryClient.invalidateQueries({ queryKey: ["calendar_data"] }),
      ]);
      toast.success("Se reinicio el sueno del dia seleccionado.");
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "No se pudo reiniciar el sueno de hoy.")),
  });

  return (
    <div className={embedded ? "space-y-5 md:space-y-6" : "container max-w-6xl space-y-5 py-6 md:space-y-6 md:py-8"}>
      <div className="flex items-center gap-3">
        <Moon className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{t("sleep.page.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("sleep.page.description")}</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 divide-x divide-y border-border/60 sm:grid-cols-4 sm:divide-y-0">
            <div className="space-y-1 p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{t("sleep.page.today")}</p>
              <p className="text-xl font-semibold md:text-2xl">{((dayData?.total_minutes ?? 0) / 60).toFixed(1)}h</p>
            </div>
            <div className="space-y-1 p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{t("sleep.page.goal")}</p>
              <p className="text-xl font-semibold md:text-2xl">{(goalData.sleep_goal_minutes / 60).toFixed(1)}h</p>
            </div>
            <div className="space-y-1 p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{t("sleep.page.avg")}</p>
              <p className="text-xl font-semibold md:text-2xl">{(avgMinutes / 60).toFixed(1)}h</p>
            </div>
            <div className="space-y-1 p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{t("sleep.page.daysMet")}</p>
              <p className="text-xl font-semibold md:text-2xl">{daysMet}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("sleep.page.logs")}</CardTitle>
            <CardDescription>
              <Input
                type="date"
                value={selectedDate.toISOString().slice(0, 10)}
                onChange={(e) => setSelectedDate(new Date(`${e.target.value}T12:00:00`))}
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!dayData || dayData.logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("sleep.page.noLogs")}</p>
            ) : (
              <div className="space-y-2">
                {dayData.logs.map((log) => (
                  <div key={log.id} className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">{(log.total_minutes / 60).toFixed(1)}h</p>
                    <p className="text-muted-foreground">
                      {log.quality ? `${t("sleep.page.quality")}: ${log.quality}/5` : "--"}
                    </p>
                    {log.notes && <p className="text-muted-foreground">{log.notes}</p>}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
              <Button
                className="w-full sm:w-auto"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const latest = dayData?.logs?.[0];
                  if (!latest) return;
                  undoMutation.mutate(latest.id);
                }}
                disabled={undoMutation.isPending || !dayData || dayData.logs.length === 0}
              >
                <Undo2 className="mr-2 h-4 w-4" />
                Deshacer ultimo ({dayData?.logs.length ?? 0})
              </Button>
              <Button
                className="w-full sm:w-auto"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (!window.confirm("Esto eliminara todos los registros de sueno de este dia. Continuar?")) return;
                  resetDayMutation.mutate();
                }}
                disabled={resetDayMutation.isPending || !dayData || dayData.logs.length === 0}
              >
                Reiniciar hoy
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("sleep.page.addTitle")}</CardTitle>
            <CardDescription>Ajusta tu meta diaria y registra el sueno del dia sin bajar en el popup.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border/70 bg-background/40 p-4">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <div className="space-y-1">
                  <Label>Meta diaria de sueno (horas)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="24"
                    step="0.5"
                    value={goalHours}
                    onChange={(e) => setGoalHours(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Por defecto son 8 horas, pero cada usuario puede personalizarla.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => goalMutation.mutate()}
                  disabled={goalMutation.isPending}
                >
                  Guardar meta
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>{t("sleep.page.totalHours")}</Label>
                <Input type="number" value={hours} onChange={(e) => setHours(e.target.value)} min="0" />
              </div>
              <div className="space-y-1">
                <Label>{t("common.minutes")}</Label>
                <Input type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} min="0" max="59" />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setAdvanced((v) => !v)}>
                {t("sleep.page.advanced")}
              </Button>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {t("sleep.page.save")}
              </Button>
            </div>

            {advanced && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label>{t("sleep.page.sleepStart")}</Label>
                    <Input type="datetime-local" value={sleepStart} onChange={(e) => setSleepStart(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>{t("sleep.page.sleepEnd")}</Label>
                    <Input type="datetime-local" value={sleepEnd} onChange={(e) => setSleepEnd(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>{t("sleep.page.quality")}</Label>
                  <Input type="number" min="1" max="5" value={quality} onChange={(e) => setQuality(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>{t("sleep.page.notes")}</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("nav.sleep")}</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant={range === "7d" ? "default" : "outline"} onClick={() => setRange("7d")}>
              {t("sleep.page.range.7d")}
            </Button>
            <Button size="sm" variant={range === "30d" ? "default" : "outline"} onClick={() => setRange("30d")}>
              {t("sleep.page.range.30d")}
            </Button>
            <Button size="sm" variant={range === "month" ? "default" : "outline"} onClick={() => setRange("month")}>
              {t("sleep.page.range.month")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("sleep.page.noLogs")}</p>
          ) : (
            <div className="h-[190px] w-full md:h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString()} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number | string) => {
                      const hoursValue = typeof value === "number" ? value : Number(value);
                      return [`${Math.round(hoursValue * 60)} min`, "Total"];
                    }}
                  />
                  <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SleepWorkspace;
