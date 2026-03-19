import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { BiofeedbackChartPoint, BodyFatChartPoint, NutritionTrendPoint } from "@/pages/stats/types";

type StatsTrendChartsGridProps = {
  rangeLabel: string;
  nutritionRangeData: NutritionTrendPoint[];
  biofeedbackChartData: BiofeedbackChartPoint[];
  bodyFatChartData: BodyFatChartPoint[];
  chartHeight: number;
  chartMargin: { top: number; right: number; left: number; bottom: number };
  isMobile: boolean;
  yAxisWidth: number;
  formatChartDate: (value: string | number, mobile: boolean) => string;
};

export function StatsTrendChartsGrid({
  rangeLabel,
  nutritionRangeData,
  biofeedbackChartData,
  bodyFatChartData,
  chartHeight,
  chartMargin,
  isMobile,
  yAxisWidth,
  formatChartDate,
}: StatsTrendChartsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Tendencias de alimentacion ({rangeLabel})</CardTitle>
          <CardDescription>Calorias y macros diarios dentro del rango activo.</CardDescription>
        </CardHeader>
        <CardContent>
          {nutritionRangeData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aun no hay datos de alimentacion.</p>
          ) : (
            <div className="w-full" style={{ height: `${chartHeight}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart margin={chartMargin} data={nutritionRangeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    minTickGap={isMobile ? 24 : 32}
                    interval="preserveStartEnd"
                    tick={{ fontSize: isMobile ? 11 : 12 }}
                    tickFormatter={(value) => formatChartDate(value, isMobile)}
                  />
                  <YAxis axisLine={false} tickLine={false} tickMargin={4} tick={{ fontSize: isMobile ? 11 : 12 }} width={yAxisWidth} />
                  <Tooltip labelFormatter={(value) => new Date(String(value)).toLocaleDateString()} />
                  <Line type="monotone" dataKey="calories" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="protein_g" stroke="#22c55e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="carbs_g" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="fat_g" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Biofeedback ({rangeLabel})</CardTitle>
          <CardDescription>Energia, estres y calidad de sueno por dia.</CardDescription>
        </CardHeader>
        <CardContent>
          {biofeedbackChartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aun no hay datos de biofeedback.</p>
          ) : (
            <div className="w-full" style={{ height: `${chartHeight}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={biofeedbackChartData} margin={chartMargin}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    minTickGap={isMobile ? 24 : 32}
                    interval="preserveStartEnd"
                    tick={{ fontSize: isMobile ? 11 : 12 }}
                    tickFormatter={(value) => formatChartDate(value, isMobile)}
                  />
                  <YAxis domain={[1, 10]} axisLine={false} tickLine={false} tickMargin={4} tick={{ fontSize: isMobile ? 11 : 12 }} width={yAxisWidth} />
                  <Tooltip labelFormatter={(value) => new Date(String(value)).toLocaleDateString()} />
                  <Line type="monotone" dataKey="energy" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="sleep_quality" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Tendencia de grasa corporal ({rangeLabel})</CardTitle>
          <CardDescription>Estimacion de grasa corporal desde medidas corporales.</CardDescription>
        </CardHeader>
        <CardContent>
          {bodyFatChartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aun no hay medidas corporales con grasa corporal.</p>
          ) : (
            <div className="w-full" style={{ height: `${chartHeight}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bodyFatChartData} margin={chartMargin}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    minTickGap={isMobile ? 24 : 32}
                    interval="preserveStartEnd"
                    tick={{ fontSize: isMobile ? 11 : 12 }}
                    tickFormatter={(value) => formatChartDate(value, isMobile)}
                  />
                  <YAxis axisLine={false} tickLine={false} tickMargin={4} tick={{ fontSize: isMobile ? 11 : 12 }} width={yAxisWidth} />
                  <Tooltip
                    labelFormatter={(value) => new Date(String(value)).toLocaleDateString()}
                    formatter={(value: number) => [`${value}%`, "Grasa corporal"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="body_fat_pct"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={bodyFatChartData.length <= 12 ? { r: isMobile ? 2.5 : 3 } : false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
