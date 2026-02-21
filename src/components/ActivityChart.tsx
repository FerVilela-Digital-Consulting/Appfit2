import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { day: "Mon", Exercise: 45, Meals: 1800, Sleep: 7.5 },
  { day: "Tue", Exercise: 60, Meals: 2100, Sleep: 6.8 },
  { day: "Wed", Exercise: 30, Meals: 1950, Sleep: 8.0 },
  { day: "Thu", Exercise: 75, Meals: 2200, Sleep: 7.2 },
  { day: "Fri", Exercise: 50, Meals: 1700, Sleep: 7.8 },
  { day: "Sat", Exercise: 90, Meals: 2400, Sleep: 8.5 },
  { day: "Sun", Exercise: 40, Meals: 2000, Sleep: 9.0 },
];

const ActivityChart = () => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
      <h3 className="text-base font-semibold text-card-foreground mb-6">Weekly Activity</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorExercise" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(195, 85%, 55%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(195, 85%, 55%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorMeals" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(10, 80%, 65%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(10, 80%, 65%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(150, 50%, 50%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(150, 50%, 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 18%, 90%)" vertical={false} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(215, 12%, 52%)" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(215, 12%, 52%)" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(0, 0%, 100%)",
              border: "1px solid hsl(214, 18%, 90%)",
              borderRadius: "12px",
              fontSize: "13px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "13px", paddingTop: "12px" }} />
          <Area type="monotone" dataKey="Exercise" stroke="hsl(195, 85%, 55%)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExercise)" />
          <Area type="monotone" dataKey="Meals" stroke="hsl(10, 80%, 65%)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMeals)" />
          <Area type="monotone" dataKey="Sleep" stroke="hsl(150, 50%, 50%)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSleep)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;
