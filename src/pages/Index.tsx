import { Dumbbell, Flame, Moon, TrendingUp } from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import StatCard from "@/components/StatCard";
import ActivityChart from "@/components/ActivityChart";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <DashboardHeader />

        <main className="flex-1 p-8">
          {/* Goal Section */}
          <div className="mb-8">
            <p className="text-sm text-muted-foreground mb-1">Current Goal</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Build Muscles</h1>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Exercise"
              value="45"
              unit="min"
              progress={72}
              icon={Dumbbell}
              variant="exercise"
            />
            <StatCard
              title="Calories"
              value="1,840"
              unit="kcal"
              progress={65}
              icon={Flame}
              variant="meals"
            />
            <StatCard
              title="Sleep"
              value="7.5"
              unit="hrs"
              progress={88}
              icon={Moon}
              variant="sleep"
            />
          </div>

          {/* Chart */}
          <ActivityChart />
        </main>
      </div>
    </div>
  );
};

export default Index;
