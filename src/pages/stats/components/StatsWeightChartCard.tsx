import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Range, WeightChartPoint } from "@/pages/stats/types";

type StatsWeightChartCardProps = {
  range: Range;
  onRangeChange: (range: Range) => void;
  chartData: WeightChartPoint[];
  chartHeight: number;
  chartMargin: { top: number; right: number; left: number; bottom: number };
  isMobile: boolean;
  yAxisWidth: number;
  formatChartDate: (value: string | number, mobile: boolean) => string;
};

export function StatsWeightChartCard({
  range,
  onRangeChange,
  chartData,
  chartHeight,
  chartMargin,
  isMobile,
  yAxisWidth,
  formatChartDate,
}: StatsWeightChartCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Tendencia de peso</CardTitle>
          <CardDescription>Peso corporal y promedio movil en el tiempo</CardDescription>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:flex sm:flex-wrap">
          {(["7d", "30d", "90d", "all"] as Range[]).map((value) => (
            <Button
              key={value}
              size="sm"
              className="min-w-0 px-2 text-xs sm:text-sm"
              variant={range === value ? "default" : "outline"}
              onClick={() => onRangeChange(value)}
            >
              {value.toUpperCase()}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay datos de peso para este rango.</p>
        ) : (
          <div className="w-full" style={{ height: `${chartHeight}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={chartMargin}>
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
                <YAxis
                  domain={["auto", "auto"]}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={4}
                  tick={{ fontSize: isMobile ? 11 : 12 }}
                  width={yAxisWidth}
                />
                <Tooltip
                  labelFormatter={(value) => new Date(String(value)).toLocaleDateString()}
                  formatter={(value: number, name: string) => [`${value} kg`, name === "weight" ? "Peso" : "Promedio movil 7d"]}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={chartData.length <= 12 ? { r: isMobile ? 2.5 : 3 } : false}
                />
                <Line type="monotone" dataKey="movingAvg7" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
