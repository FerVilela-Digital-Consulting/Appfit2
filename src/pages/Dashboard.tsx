import { useMemo, useState } from "react";
import { Dumbbell, Flame, Moon, TrendingUp, User, Weight, Ruler } from "lucide-react";
import StatCard from "@/components/StatCard";
import ActivityChart from "@/components/ActivityChart";
import { Button } from "@/components/ui/button";
import EditProfileModal from "@/components/profile/EditProfileModal";

import { useAuth } from "@/context/AuthContext";

const Dashboard = () => {
  const { profile, user, isGuest } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const greetingName = useMemo(() => {
    if (profile?.full_name?.trim()) return profile.full_name;
    if (isGuest) return "Guest";
    return user?.email || "User";
  }, [profile?.full_name, isGuest, user?.email]);
  const heightLabel = profile?.height ? `${profile.height}cm` : "—";
  const weightLabel = profile?.weight ? `${profile.weight}kg` : "—";
  const goalLabel = profile?.goal_type || "—";

  return (
    <>
      {/* Header / Profile Summary Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              {greetingName}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground ml-7">
            <span className="flex items-center gap-1">
              <Weight className="w-3.5 h-3.5" /> {weightLabel}
            </span>
            <span className="flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5" /> {heightLabel}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> {goalLabel}
            </span>
            <Button variant="link" className="h-auto p-0 text-sm" onClick={() => setIsEditModalOpen(true)}>
              Edit details
            </Button>
          </div>
        </div>
      </div>

      <EditProfileModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Exercise" value="45" unit="min" progress={72} icon={Dumbbell} variant="exercise" />
        <StatCard title="Calories" value="1,840" unit="kcal" progress={65} icon={Flame} variant="meals" />
        <StatCard title="Sleep" value="7.5" unit="hrs" progress={88} icon={Moon} variant="sleep" />
      </div>

      {/* Chart */}
      <ActivityChart />
    </>
  );
};

export default Dashboard;
