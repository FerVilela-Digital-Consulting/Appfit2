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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [activeTab, setActiveTab] = useState<"base" | "goal">("base");
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
  }, [profile]);

  const selectedActivity = useMemo(() => ACTIVITY_OPTIONS.find((option) => option.value === activityLevel), [activityLevel]);
  const selectedGoal = useMemo(() => GOAL_OPTIONS.find((option) => option.value === nutritionGoalType), [nutritionGoalType]);

  const validateBaseStep = () => {
    const parsedWeight = Number(weightKg);
    const parsedHeight = Number(heightCm);

    if (!fullName.trim()) {
      toast.error("Ingresa tu nombre.");
      return false;
    }

    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      toast.error("El peso debe ser mayor que 0.");
      return false;
    }

    if (!Number.isFinite(parsedHeight) || parsedHeight <= 0) {
      toast.error("La altura debe ser mayor que 0.");
      return false;
    }

    if (birthDate) {
      const age = calculateAge(birthDate);
      if (age === null || age < 12 || age > 95) {
        toast.error("La edad debe estar entre 12 y 95 anos.");
        return false;
      }
    }

    return true;
  };

  const validateGoalStep = () => {
    if (!targetWeightKg) return true;

    const parsedTargetWeight = Number(targetWeightKg);
    if (!Number.isFinite(parsedTargetWeight) || parsedTargetWeight < 20 || parsedTargetWeight > 400) {
      toast.error("La meta de peso debe estar entre 20 y 400 kg.");
      return false;
    }

    if (!targetDate) {
      toast.error("La fecha objetivo es obligatoria si defines una meta de peso.");
      return false;
    }

    return true;
  };

  const goNextFromBase = () => {
    if (!validateBaseStep()) return;
    setActiveTab("goal");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const parsedWeight = Number(weightKg);
    const parsedHeight = Number(heightCm);
    const parsedTargetWeight = targetWeightKg ? Number(targetWeightKg) : null;

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
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "base" | "goal")} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="base">Base</TabsTrigger>
                  <TabsTrigger value="goal">Meta de peso</TabsTrigger>
                </TabsList>

                <TabsContent value="base" className="space-y-6 pt-3">
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
                </TabsContent>

                <TabsContent value="goal" className="space-y-4 pt-3">
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
                </TabsContent>

              </Tabs>
            </CardContent>

            <CardFooter className="border-t pt-6">
              <div className="flex w-full items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (activeTab === "goal") setActiveTab("base");
                  }}
                  disabled={activeTab === "base" || isSaving}
                >
                  Atras
                </Button>
                {activeTab === "base" && (
                  <Button type="button" onClick={goNextFromBase}>
                    Siguiente
                  </Button>
                )}
                {activeTab === "goal" && (
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Guardando..." : "Finalizar onboarding"}
                  </Button>
                )}
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
