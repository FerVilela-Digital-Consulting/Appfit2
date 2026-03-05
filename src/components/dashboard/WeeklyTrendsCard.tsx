import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type TrendRow = {
  dateKey: string;
  label: string;
  water: number;
  sleep: number;
  weight: number | null;
};

type Props = {
  loading?: boolean;
  data: TrendRow[];
};

const TrendChart = ({
  title,
  color,
  data,
  dataKey,
  formatter,
}: {
  title: string;
  color: string;
  data: TrendRow[];
  dataKey: "water" | "sleep" | "weight";
  formatter: (value: number | null) => string;
}) => (
  <div className="rounded-lg border border-border/60 p-3">
    <p className="text-xs text-muted-foreground mb-2">{title}</p>
    <div className="h-24 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip formatter={(value: any) => formatter(typeof value === "number" ? value : Number(value) || 0)} labelFormatter={(label) => `Dia ${label}`} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const WeeklyTrendsCard = ({ loading = false, data }: Props) => {
  if (loading) {
    return (
      <Card className="rounded-2xl border-border/60 bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle>Weekly Trends</CardTitle>
          <CardDescription>Evolucion de los ultimos 7 dias.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border/60 bg-card/80 shadow-sm">
      <CardHeader>
        <CardTitle>Weekly Trends</CardTitle>
        <CardDescription>Peso, agua y sueno en ventana de 7 dias.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-3">
        <TrendChart
          title="Peso (kg)"
          color="hsl(var(--primary))"
          data={data}
          dataKey="weight"
          formatter={(v) => (v === null || v === undefined ? "--" : `${v.toFixed(1)} kg`)}
        />
        <TrendChart title="Agua (ml)" color="#0ea5e9" data={data} dataKey="water" formatter={(v) => `${Math.round(v || 0)} ml`} />
        <TrendChart
          title="Sueno (h)"
          color="#6366f1"
          data={data.map((item) => ({ ...item, sleep: Number((item.sleep / 60).toFixed(2)) }))}
          dataKey="sleep"
          formatter={(v) => `${Number(v || 0).toFixed(1)} h`}
        />
      </CardContent>
    </Card>
  );
};

export default WeeklyTrendsCard;
