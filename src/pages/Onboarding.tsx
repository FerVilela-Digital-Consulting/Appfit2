import { FormEvent, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { ACTIVITY_OPTIONS, GOAL_OPTIONS } from "@/lib/metabolismOptions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getErrorMessage } from "@/lib/errors";

type BiologicalSex = "male" | "female";
type ActivityLevel = "low" | "moderate" | "high" | "very_high" | "hyperactive";
type NutritionGoalType = "lose" | "lose_slow" | "maintain" | "gain_slow" | "gain";
type GoalDirection = "lose" | "gain" | "maintain";

const calculateAge = (birthDate: string) => {
  const parsed = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - parsed.getFullYear();
  const monthDiff = today.getMonth() - parsed.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsed.getDate())) {
    age -= 1;
  }
  return age;
};

const Onboarding = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile, isGuest, updateProfile, completeOnboarding } = useAuth();

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [biologicalSex, setBiologicalSex] = useState<BiologicalSex>("male");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [nutritionGoalType, setNutritionGoalType] = useState<NutritionGoalType>("maintain");
  const [targetWeightKg, setTargetWeightKg] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [goalDirection, setGoalDirection] = useState<GoalDirection>("lose");
  const [sleepGoalMinutes, setSleepGoalMinutes] = useState("480");
  const [calorieGoal, setCalorieGoal] = useState("2000");
  const [proteinGoal, setProteinGoal] = useState("150");
  const [carbGoal, setCarbGoal] = useState("250");
  const [fatGoal, setFatGoal] = useState("70");
  const [waterGoalMl, setWaterGoalMl] = useState("2000");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;

    setFullName(profile.full_name ?? "");
    setBirthDate(profile.birth_date ?? "");
    setWeightKg(profile.weight !== null && profile.weight !== undefined ? String(profile.weight) : "");
    setHeightCm(profile.height !== null && profile.height !== undefined ? String(profile.height) : "");
    setBiologicalSex(profile.biological_sex ?? "male");
    setActivityLevel(profile.activity_level ?? "moderate");
    setNutritionGoalType(profile.nutrition_goal_type ?? "maintain");
    setTargetWeightKg(profile.target_weight_kg !== null && profile.target_weight_kg !== undefined ? String(profile.target_weight_kg) : "");
    setTargetDate(profile.target_date ?? "");
    setGoalDirection((profile.goal_direction as GoalDirection | null) ?? "lose");
    setSleepGoalMinutes(profile.sleep_goal_minutes !== null && profile.sleep_goal_minutes !== undefined ? String(profile.sleep_goal_minutes) : "480");
    setCalorieGoal(profile.calorie_goal !== null && profile.calorie_goal !== undefined ? String(profile.calorie_goal) : "2000");
    setProteinGoal(profile.protein_goal_g !== null && profile.protein_goal_g !== undefined ? String(profile.protein_goal_g) : "150");
    setCarbGoal(profile.carb_goal_g !== null && profile.carb_goal_g !== undefined ? String(profile.carb_goal_g) : "250");
    setFatGoal(profile.fat_goal_g !== null && profile.fat_goal_g !== undefined ? String(profile.fat_goal_g) : "70");
    setWaterGoalMl(profile.water_goal_ml !== null && profile.water_goal_ml !== undefined ? String(profile.water_goal_ml) : "2000");
  }, [profile]);

  const selectedActivity = useMemo(() => ACTIVITY_OPTIONS.find((option) => option.value === activityLevel), [activityLevel]);
  const selectedGoal = useMemo(() => GOAL_OPTIONS.find((option) => option.value === nutritionGoalType), [nutritionGoalType]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const parsedWeight = Number(weightKg);
    const parsedHeight = Number(heightCm);
    const parsedTargetWeight = targetWeightKg ? Number(targetWeightKg) : null;
    const parsedSleepGoal = Number(sleepGoalMinutes);
    const parsedCalorieGoal = Number(calorieGoal);
    const parsedProteinGoal = Number(proteinGoal);
    const parsedCarbGoal = Number(carbGoal);
    const parsedFatGoal = Number(fatGoal);
    const parsedWaterGoal = Number(waterGoalMl);

    if (!fullName.trim()) {
      toast.error("Ingresa tu nombre.");
      return;
    }

    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      toast.error("El peso debe ser mayor que 0.");
      return;
    }

    if (!Number.isFinite(parsedHeight) || parsedHeight <= 0) {
      toast.error("La altura debe ser mayor que 0.");
      return;
    }

    if (birthDate) {
      const age = calculateAge(birthDate);
      if (age === null || age < 12 || age > 95) {
        toast.error("La edad debe estar entre 12 y 95 anos.");
        return;
      }
    }

    if (parsedTargetWeight !== null && (!Number.isFinite(parsedTargetWeight) || parsedTargetWeight < 20 || parsedTargetWeight > 400)) {
      toast.error("La meta de peso debe estar entre 20 y 400 kg.");
      return;
    }

    if (parsedTargetWeight !== null && !targetDate) {
      toast.error("La fecha objetivo es obligatoria si defines una meta de peso.");
      return;
    }

    if (!Number.isFinite(parsedSleepGoal) || parsedSleepGoal <= 0 || parsedSleepGoal > 1440) {
      toast.error("La meta de sueno debe estar entre 1 y 1440 minutos.");
      return;
    }

    if (!Number.isFinite(parsedCalorieGoal) || parsedCalorieGoal <= 0) {
      toast.error("La meta de calorias debe ser mayor que 0.");
      return;
    }

    if (!Number.isFinite(parsedProteinGoal) || parsedProteinGoal < 0) {
      toast.error("La meta de proteina no puede ser negativa.");
      return;
    }

    if (!Number.isFinite(parsedCarbGoal) || parsedCarbGoal < 0) {
      toast.error("La meta de carbohidratos no puede ser negativa.");
      return;
    }

    if (!Number.isFinite(parsedFatGoal) || parsedFatGoal < 0) {
      toast.error("La meta de grasas no puede ser negativa.");
      return;
    }

    if (!Number.isFinite(parsedWaterGoal) || parsedWaterGoal <= 0) {
      toast.error("La meta de agua debe ser mayor que 0.");
      return;
    }

    setIsSaving(true);
    try {
      const profileUpdate: Parameters<typeof updateProfile>[0] = {
        full_name: fullName.trim(),
        birth_date: birthDate || null,
        weight: parsedWeight,
        height: parsedHeight,
        biological_sex: biologicalSex,
        activity_level: activityLevel,
        nutrition_goal_type: nutritionGoalType,
        goal_type: selectedGoal?.legacyGoalTypeLabel ?? "Maintain Weight",
        target_weight_kg: parsedTargetWeight,
        target_date: parsedTargetWeight ? targetDate : null,
        start_weight_kg: parsedTargetWeight ? parsedWeight : null,
        goal_direction: parsedTargetWeight ? goalDirection : null,
        sleep_goal_minutes: parsedSleepGoal,
        calorie_goal: parsedCalorieGoal,
        protein_goal_g: parsedProteinGoal,
        carb_goal_g: parsedCarbGoal,
        fat_goal_g: parsedFatGoal,
        water_goal_ml: parsedWaterGoal,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || profile?.timezone || null,
      };

      await updateProfile(profileUpdate);

      if (!isGuest) {
        await completeOnboarding();
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["nutrition_day_summary"] }),
        queryClient.invalidateQueries({ queryKey: ["nutrition_target_breakdown"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard_snapshot"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard_tremor_nutrition_7d"] }),
        queryClient.invalidateQueries({ queryKey: ["stats_nutrition_goals"] }),
      ]);

      toast.success("Onboarding completado.");
      navigate("/today", { replace: true });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "No se pudo completar el onboarding."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Configura tu perfil metabolico</CardTitle>
            <CardDescription>
              Esta configuracion conecta onboarding, perfil, biometria y nutricion para calcular targets automaticos.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="fullName">Nombre</Label>
                  <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Tu nombre" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Fecha de nacimiento</Label>
                  <Input id="birthDate" type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Sexo biologico</Label>
                  <Select value={biologicalSex} onValueChange={(value) => setBiologicalSex(value as "male" | "female")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weightKg">Peso actual (kg)</Label>
                  <Input id="weightKg" type="number" min="1" step="0.1" value={weightKg} onChange={(event) => setWeightKg(event.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heightCm">Altura (cm)</Label>
                  <Input id="heightCm" type="number" min="1" value={heightCm} onChange={(event) => setHeightCm(event.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Objetivo fisico</Label>
                <Select value={nutritionGoalType} onValueChange={(value) => setNutritionGoalType(value as typeof nutritionGoalType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{selectedGoal?.description}</p>
              </div>

              <div className="space-y-2">
                <Label>Nivel de actividad (PAL)</Label>
                <Select value={activityLevel} onValueChange={(value) => setActivityLevel(value as typeof activityLevel)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{selectedActivity?.description}</p>
              </div>

              <div className="space-y-4 rounded-xl border p-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Meta de peso (opcional)</p>
                  <p className="text-xs text-muted-foreground">Si la completas, activamos progreso desde el primer dia.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="targetWeightKg">Peso objetivo (kg)</Label>
                    <Input id="targetWeightKg" type="number" min="20" max="400" step="0.1" value={targetWeightKg} onChange={(event) => setTargetWeightKg(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetDate">Fecha objetivo</Label>
                    <Input id="targetDate" type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Direccion de la meta</Label>
                    <Select value={goalDirection} onValueChange={(value) => setGoalDirection(value as GoalDirection)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lose">Bajar</SelectItem>
                        <SelectItem value="gain">Subir</SelectItem>
                        <SelectItem value="maintain">Mantener</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-xl border p-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Metas metabolicas iniciales</p>
                  <p className="text-xs text-muted-foreground">Puedes ajustarlas despues en Fitness Profile.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sleepGoalMinutes">Sueno objetivo (min)</Label>
                    <Input id="sleepGoalMinutes" type="number" min="1" max="1440" value={sleepGoalMinutes} onChange={(event) => setSleepGoalMinutes(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waterGoalMl">Agua objetivo (ml)</Label>
                    <Input id="waterGoalMl" type="number" min="100" step="50" value={waterGoalMl} onChange={(event) => setWaterGoalMl(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calorieGoal">Calorias objetivo</Label>
                    <Input id="calorieGoal" type="number" min="1" value={calorieGoal} onChange={(event) => setCalorieGoal(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proteinGoal">Proteina objetivo (g)</Label>
                    <Input id="proteinGoal" type="number" min="0" value={proteinGoal} onChange={(event) => setProteinGoal(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carbGoal">Carbohidratos objetivo (g)</Label>
                    <Input id="carbGoal" type="number" min="0" value={carbGoal} onChange={(event) => setCarbGoal(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fatGoal">Grasas objetivo (g)</Label>
                    <Input id="fatGoal" type="number" min="0" value={fatGoal} onChange={(event) => setFatGoal(event.target.value)} />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-t pt-6">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Guardando..." : "Finalizar onboarding"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
