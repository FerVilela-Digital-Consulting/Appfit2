import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Droplets } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useAuth } from "@/context/AuthContext";
import { DEFAULT_WATER_TIMEZONE, getDateKeyForTimezone } from "@/features/water/waterUtils";
import { getWaterDayTotal, getWaterGoal, getWaterLogsByDate, getWaterRangeTotals } from "@/services/waterIntake";
import WaterCard from "@/components/dashboard/WaterCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Range = "7d" | "30d" | "month";

type WaterWorkspaceProps = {
  embedded?: boolean;
};

const WaterWorkspace = ({ embedded = false }: WaterWorkspaceProps) => {
  const { user, isGuest, profile } = useAuth();
  const [range, setRange] = useState<Range>("7d");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const tz = profile?.timezone || DEFAULT_WATER_TIMEZONE;
  const today = useMemo(() => new Date(), []);
  const dayKey = getDateKeyForTimezone(today, tz);

  const rangeDates = useMemo(() => {
    const to = new Date();
    to.setHours(0, 0, 0, 0);
    const from = new Date(to);
    if (range === "7d") from.setDate(from.getDate() - 6);
    if (range === "30d") from.setDate(from.getDate() - 29);
    if (range === "month") {
      from.setDate(1);
    }
    return { from, to };
  }, [range]);

  const { data: todayTotal = 0 } = useQuery({
    queryKey: ["water_day_total", user?.id, dayKey],
    queryFn: () => getWaterDayTotal(user?.id ?? null, today, { isGuest, timeZone: tz }),
    enabled: Boolean(user?.id) || isGuest,
  });

  const { data: goal = { water_goal_ml: 2000, water_quick_options_ml: [250, 500, 1000, 2000] } } = useQuery({
    queryKey: ["water_goal", user?.id],
    queryFn: () => getWaterGoal(user?.id ?? null, { isGuest }),
    enabled: Boolean(user?.id) || isGuest,
  });

  const { data: totals = [] } = useQuery({
    queryKey: ["water_range", user?.id, range, rangeDates.from.toISOString(), rangeDates.to.toISOString()],
    queryFn: () => getWaterRangeTotals(user?.id ?? null, rangeDates.from, rangeDates.to, { isGuest, timeZone: tz }),
    enabled: Boolean(user?.id) || isGuest,
  });

  const { data: selectedLogs = [] } = useQuery({
    queryKey: ["water_logs_day", user?.id, selectedDate.toISOString().slice(0, 10)],
    queryFn: () => getWaterLogsByDate(user?.id ?? null, selectedDate, { isGuest, timeZone: tz }),
    enabled: Boolean(user?.id) || isGuest,
  });

  const chartData = totals.map((item) => ({
    date: item.date_key,
    liters: Number((item.total_ml / 1000).toFixed(2)),
    total_ml: item.total_ml,
  }));

  const avgMl = totals.length
    ? Math.round(totals.reduce((sum, item) => sum + item.total_ml, 0) / totals.length)
    : 0;
  const daysMet = totals.filter((item) => item.total_ml >= goal.water_goal_ml).length;

  return (
    <div className={embedded ? "space-y-5 md:space-y-6" : "container max-w-6xl space-y-5 py-6 md:space-y-6 md:py-8"}>
      <div className="flex items-center gap-3">
        <Droplets className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Agua</h1>
          <p className="text-sm text-muted-foreground">
            Sigue tu hidratación diaria y revisa tendencia, meta y registros sin salir del centro operativo.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 divide-x divide-y border-border/60 sm:grid-cols-4 sm:divide-y-0">
            <div className="space-y-1 p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Hoy</p>
              <p className="text-xl font-semibold md:text-2xl">{todayTotal} ml</p>
            </div>
            <div className="space-y-1 p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Meta</p>
              <p className="text-xl font-semibold md:text-2xl">{goal.water_goal_ml} ml</p>
            </div>
            <div className="space-y-1 p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Promedio</p>
              <p className="text-xl font-semibold md:text-2xl">{avgMl} ml</p>
            </div>
            <div className="space-y-1 p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Días con meta</p>
              <p className="text-xl font-semibold md:text-2xl">{daysMet}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Registros de agua</CardTitle>
            <CardDescription>
              <input
                type="date"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedDate.toISOString().slice(0, 10)}
                onChange={(e) => setSelectedDate(new Date(`${e.target.value}T12:00:00`))}
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay registros de agua para esta fecha.</p>
            ) : (
              <div className="space-y-2">
                {selectedLogs.map((log) => (
                  <div key={log.id} className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">{log.consumed_ml} ml</p>
                    <p className="text-muted-foreground">
                      {new Date(log.logged_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <WaterCard showHistoryButton={false} />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Hidratación</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant={range === "7d" ? "default" : "outline"} onClick={() => setRange("7d")}>
              Semana
            </Button>
            <Button size="sm" variant={range === "30d" ? "default" : "outline"} onClick={() => setRange("30d")}>
              30 días
            </Button>
            <Button size="sm" variant={range === "month" ? "default" : "outline"} onClick={() => setRange("month")}>
              Este mes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin datos para el rango seleccionado.</p>
          ) : (
            <div className="h-[190px] w-full md:h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 10, left: 0, bottom: 2 }}>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border) / 0.45)" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short" }).format(new Date(value)).replace(".", "")
                    }
                    tickLine={false}
                    axisLine={{ stroke: "hsl(var(--border) / 0.7)" }}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    dy={8}
                  />
                  <YAxis
                    tickFormatter={(value) => `${Math.round(Number(value) * 1000)} ml`}
                    tickLine={false}
                    axisLine={{ stroke: "hsl(var(--border) / 0.7)" }}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      borderColor: "hsl(var(--border))",
                      color: "hsl(var(--popover-foreground))",
                      borderRadius: "0.75rem",
                    }}
                    itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                    labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                    labelFormatter={(value) =>
                      new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short" }).format(new Date(String(value))).replace(".", "")
                    }
                    formatter={(value: number | string) => {
                      const liters = typeof value === "number" ? value : Number(value);
                      return [`${Math.round(liters * 1000)} ml`, "Agua"];
                    }}
                  />
                  <Bar dataKey="liters" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WaterWorkspace;
