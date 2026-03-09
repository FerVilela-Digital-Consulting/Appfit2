import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { GOAL_OPTIONS } from "@/lib/metabolismOptions";
import ProfileCalibrationPanel from "@/components/profile/ProfileCalibrationPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Profile = () => {
  const { profile, updateProfile, isGuest } = useAuth();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [biologicalSex, setBiologicalSex] = useState<"male" | "female">("male");
  const [activityLevel, setActivityLevel] = useState<"low" | "moderate" | "high" | "very_high" | "hyperactive">("moderate");
  const [nutritionGoalType, setNutritionGoalType] = useState<"lose" | "lose_slow" | "maintain" | "gain_slow" | "gain">("maintain");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;

    setFullName(profile.full_name || "");
    setBirthDate(profile.birth_date || "");
    setWeight(profile.weight?.toString() || "");
    setHeight(profile.height?.toString() || "");
    setBiologicalSex((profile.biological_sex as "male" | "female" | null) ?? "male");
    setActivityLevel((profile.activity_level as "low" | "moderate" | "high" | "very_high" | "hyperactive" | null) ?? "moderate");
    setNutritionGoalType((profile.nutrition_goal_type as "lose" | "lose_slow" | "maintain" | "gain_slow" | "gain" | null) ?? "maintain");
  }, [profile]);

  const selectedGoal = useMemo(() => GOAL_OPTIONS.find((option) => option.value === nutritionGoalType), [nutritionGoalType]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedWeight = weight ? Number(weight) : null;
    const parsedHeight = height ? Number(height) : null;
    const parsedBirthDate = birthDate ? new Date(`${birthDate}T00:00:00`) : null;

    if (parsedBirthDate && Number.isNaN(parsedBirthDate.getTime())) {
      toast.error("La fecha de nacimiento no es valida.");
      return;
    }
    if (parsedBirthDate) {
      const now = new Date();
      let age = now.getFullYear() - parsedBirthDate.getFullYear();
      const monthDiff = now.getMonth() - parsedBirthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < parsedBirthDate.getDate())) {
        age -= 1;
      }
      if (age < 12 || age > 95) {
        toast.error("La edad debe estar entre 12 y 95 anios.");
        return;
      }
    }

    if (parsedWeight !== null && (!Number.isFinite(parsedWeight) || parsedWeight <= 0)) {
      toast.error("El peso debe ser mayor que 0.");
      return;
    }

    if (parsedHeight !== null && (!Number.isFinite(parsedHeight) || parsedHeight <= 0)) {
      toast.error("La altura debe ser mayor que 0.");
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        full_name: fullName,
        birth_date: birthDate || null,
        weight: parsedWeight,
        height: parsedHeight,
        biological_sex: biologicalSex,
        activity_level: activityLevel,
        nutrition_goal_type: nutritionGoalType,
        goal_type: selectedGoal?.legacyGoalTypeLabel ?? "Maintain Weight",
      } as any);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["nutrition_day_summary"] }),
        queryClient.invalidateQueries({ queryKey: ["nutrition_target_breakdown"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard_snapshot"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard_tremor_nutrition_7d"] }),
        queryClient.invalidateQueries({ queryKey: ["stats_nutrition_goals"] }),
        queryClient.invalidateQueries({ queryKey: ["calendar_day_nutrition"] }),
        queryClient.invalidateQueries({ queryKey: ["calendar_data"] }),
      ]);

      if (isGuest) {
        toast.info("Modo invitado: los cambios no se guardaran.");
      } else {
        toast.success("Perfil actualizado correctamente");
      }
    } catch {
      toast.error("No se pudo actualizar el perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ajustes de perfil</CardTitle>
          <CardDescription>
            {isGuest
              ? "Estas viendo el perfil en modo invitado. Los cambios no se guardaran."
              : "Gestiona tu informacion personal, objetivo y nivel de actividad."}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSave}>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl">{fullName ? getInitials(fullName) : <User className="h-12 w-12" />}</AvatarFallback>
              </Avatar>
              <div className="space-y-1 text-center">
                <h3 className="text-lg font-medium">{fullName || (isGuest ? "Usuario invitado" : "Usuario nuevo")}</h3>
                <p className="text-sm text-muted-foreground">{isGuest ? "Sesion temporal" : "Personaliza tu cuenta"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
              <Label htmlFor="fullName">Nombre completo</Label>
                <Input id="fullName" placeholder="Ingresa tu nombre completo" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <ProfileCalibrationPanel
                  birthDate={birthDate}
                  onBirthDateChange={setBirthDate}
                  biologicalSex={biologicalSex}
                  onBiologicalSexChange={setBiologicalSex}
                  weight={weight}
                  onWeightChange={setWeight}
                  height={height}
                  onHeightChange={setHeight}
                  activityLevel={activityLevel}
                  onActivityLevelChange={setActivityLevel}
                  nutritionGoalType={nutritionGoalType}
                  onNutritionGoalTypeChange={setNutritionGoalType}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <p className="text-xs text-muted-foreground">{selectedGoal?.description}</p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end border-t pt-6">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
