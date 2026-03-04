import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Droplets, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import {
  addWaterIntake,
  deleteWaterLog,
  getWaterDayTotal,
  getWaterGoal,
  getWaterLogsByDate,
  getWaterWeeklySummary,
  updateWaterGoal,
  updateWaterQuickOptions,
} from "@/services/waterIntake";
import type { WaterLog } from "@/services/waterIntake";
import {
  calculateWaterProgress,
  DEFAULT_WATER_PRESETS_ML,
  DEFAULT_WATER_TIMEZONE,
  getDateKeyForTimezone,
  normalizeWaterPresets,
} from "@/features/water/waterUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const toLiters = (ml: number) => `${(ml / 1000).toFixed(2)} L`;

const WaterCard = () => {
  const { user, isGuest, profile } = useAuth();
  const queryClient = useQueryClient();

  const timeZone = (profile as any)?.timezone || DEFAULT_WATER_TIMEZONE;
  const today = useMemo(() => new Date(), []);
  const dayKey = useMemo(() => getDateKeyForTimezone(today, timeZone), [timeZone, today]);

  const [selectedQuickMl, setSelectedQuickMl] = useState<string>("250");
  const [customOpen, setCustomOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [customUnit, setCustomUnit] = useState<"ml" | "l">("ml");
  const [saveAsPreset, setSaveAsPreset] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [goalUnit, setGoalUnit] = useState<"ml" | "l">("ml");
  const [lastAddedLog, setLastAddedLog] = useState<WaterLog | null>(null);

  const { data: dayTotal = 0 } = useQuery({
    queryKey: ["water_day_total", user?.id, dayKey],
    queryFn: () => getWaterDayTotal(user?.id ?? null, today, { isGuest, timeZone }),
    enabled: Boolean(user?.id) || isGuest,
  });

  const { data: goalData } = useQuery({
    queryKey: ["water_goal", user?.id],
    queryFn: () => getWaterGoal(user?.id ?? null, { isGuest }),
    enabled: Boolean(user?.id) || isGuest,
  });

  const { data: weekSummary } = useQuery({
    queryKey: ["water_week_summary", user?.id, dayKey],
    queryFn: () => getWaterWeeklySummary(user?.id ?? null, today, { isGuest }),
    enabled: Boolean(user?.id) || isGuest,
  });

  const { data: todayLogs = [] } = useQuery({
    queryKey: ["water_logs_day", user?.id, dayKey],
    queryFn: () => getWaterLogsByDate(user?.id ?? null, today, { isGuest, timeZone }),
    enabled: Boolean(user?.id) || isGuest,
  });

  const addMutation = useMutation({
    mutationFn: (consumedMl: number) =>
      addWaterIntake({
        userId: user?.id ?? null,
        consumed_ml: consumedMl,
        timeZone,
        isGuest,
      }),
    onMutate: async (consumedMl) => {
      const key = ["water_day_total", user?.id, dayKey] as const;
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<number>(key) ?? 0;
      queryClient.setQueryData<number>(key, previous + consumedMl);
      return { previous };
    },
    onError: (error: any, _consumedMl, context) => {
      const key = ["water_day_total", user?.id, dayKey] as const;
      queryClient.setQueryData<number>(key, context?.previous ?? 0);
      toast.error(error?.message || "Failed to add water log.");
    },
    onSuccess: (log) => {
      setLastAddedLog(log);
      queryClient.invalidateQueries({ queryKey: ["water_day_total", user?.id, dayKey] });
      queryClient.invalidateQueries({ queryKey: ["water_logs_day", user?.id, dayKey] });
      queryClient.invalidateQueries({ queryKey: ["water_week_summary", user?.id, dayKey] });
      queryClient.invalidateQueries({ queryKey: ["water_range", user?.id] });
    },
  });

  const undoMutation = useMutation({
    mutationFn: (id: string) => deleteWaterLog(id, user?.id ?? null, { isGuest }),
    onSuccess: () => {
      setLastAddedLog(null);
      queryClient.invalidateQueries({ queryKey: ["water_day_total", user?.id, dayKey] });
      queryClient.invalidateQueries({ queryKey: ["water_logs_day", user?.id, dayKey] });
      queryClient.invalidateQueries({ queryKey: ["water_week_summary", user?.id, dayKey] });
      queryClient.invalidateQueries({ queryKey: ["water_range", user?.id] });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: (goalMl: number) => updateWaterGoal(user?.id ?? null, goalMl, { isGuest }),
    onSuccess: (goalMl) => {
      queryClient.setQueryData(["water_goal", user?.id], (prev: any) => ({
        water_goal_ml: goalMl,
        water_quick_options_ml: prev?.water_quick_options_ml ?? DEFAULT_WATER_PRESETS_ML,
      }));
      queryClient.invalidateQueries({ queryKey: ["water_week_summary", user?.id, dayKey] });
      toast.success("Water goal updated.");
    },
    onError: (error: any) => toast.error(error?.message || "Failed to update goal."),
  });

  const updatePresetsMutation = useMutation({
    mutationFn: (options: number[]) => updateWaterQuickOptions(user?.id ?? null, options, { isGuest }),
    onSuccess: (options) => {
      queryClient.setQueryData(["water_goal", user?.id], (prev: any) => ({
        water_goal_ml: prev?.water_goal_ml ?? 2000,
        water_quick_options_ml: options,
      }));
    },
  });

  const goalMl = goalData?.water_goal_ml ?? 2000;
  const quickOptions = normalizeWaterPresets(goalData?.water_quick_options_ml ?? DEFAULT_WATER_PRESETS_ML);
  const progress = calculateWaterProgress(dayTotal, goalMl);

  useEffect(() => {
    if (selectedQuickMl === "custom") return;
    if (!quickOptions.some((option) => String(option) === selectedQuickMl)) {
      setSelectedQuickMl(String(quickOptions[0] ?? 250));
    }
  }, [quickOptions, selectedQuickMl]);

  const handleAddQuick = async (amount: number) => {
    await addMutation.mutateAsync(amount);
    toast.success(`Added ${amount} ml.`);
  };

  const handleAddCustom = async () => {
    const numeric = Number(customValue);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }

    const ml = customUnit === "l" ? Math.round(numeric * 1000) : Math.round(numeric);
    if (ml > 10000 && !window.confirm("This is more than 10L in one entry. Continue?")) {
      return;
    }

    await addMutation.mutateAsync(ml);

    if (saveAsPreset) {
      const next = normalizeWaterPresets([...quickOptions, ml]);
      await updatePresetsMutation.mutateAsync(next);
    }

    setCustomOpen(false);
    setCustomValue("");
    setCustomUnit("ml");
    setSaveAsPreset(false);
    toast.success(`Added ${ml} ml.`);
  };

  const handleSaveGoal = async () => {
    const value = Number(goalInput);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Goal must be greater than 0.");
      return;
    }
    const goal = goalUnit === "l" ? Math.round(value * 1000) : Math.round(value);
    await updateGoalMutation.mutateAsync(goal);
    setGoalInput("");
    setGoalUnit("ml");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-primary" />
          Agua hoy
        </CardTitle>
        <CardDescription>Registro rapido y seguimiento de objetivo diario.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-semibold">
              {dayTotal} ml / {goalMl} ml
            </p>
            <p className="text-sm text-muted-foreground">
              {toLiters(dayTotal)} de {toLiters(goalMl)}
            </p>
          </div>
          <p className="text-sm font-medium">{progress.toFixed(0)}%</p>
        </div>
        <Progress value={progress} />

        <div className="grid gap-2 md:grid-cols-[1fr_auto]">
          <Button size="lg" onClick={() => handleAddQuick(250)} disabled={addMutation.isPending}>
            + 1 vaso (250 ml)
          </Button>
          <div className="flex gap-2">
            <Select value={selectedQuickMl} onValueChange={setSelectedQuickMl}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Opciones" />
              </SelectTrigger>
              <SelectContent>
                {quickOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} ml
                  </SelectItem>
                ))}
                <SelectItem value="custom">Personalizado...</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                if (selectedQuickMl === "custom") {
                  setCustomOpen(true);
                  return;
                }
                void handleAddQuick(Number(selectedQuickMl));
              }}
              disabled={addMutation.isPending}
            >
              Agregar
            </Button>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-[1fr_auto]">
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Input
              type="number"
              min="1"
              step="1"
              placeholder={`Objetivo actual: ${goalMl} ml`}
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
            />
            <Select value={goalUnit} onValueChange={(value: "ml" | "l") => setGoalUnit(value)}>
              <SelectTrigger className="w-[90px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ml">ml</SelectItem>
                <SelectItem value="l">L</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={handleSaveGoal} disabled={updateGoalMutation.isPending}>
            Guardar objetivo
          </Button>
        </div>

        <div className="rounded-lg border p-3 text-sm">
          <p className="font-medium">Resumen semanal</p>
          <p className="text-muted-foreground">
            Promedio: {weekSummary?.average_ml ?? 0} ml/dia | Cumplidos: {weekSummary?.days_met ?? 0}/
            {weekSummary?.days_total ?? 7}
          </p>
        </div>

        {todayLogs.length === 0 && <p className="text-xs text-muted-foreground">No hay consumos registrados hoy.</p>}

        {lastAddedLog && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => undoMutation.mutate(lastAddedLog.id)}
            disabled={undoMutation.isPending}
          >
            <Undo2 className="mr-2 h-4 w-4" />
            Deshacer ultimo registro
          </Button>
        )}
      </CardContent>

      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar consumo personalizado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Input
                type="number"
                min="1"
                step="1"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder="Cantidad"
              />
              <Select value={customUnit} onValueChange={(value: "ml" | "l") => setCustomUnit(value)}>
                <SelectTrigger className="w-[90px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="l">L</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="savePreset" checked={saveAsPreset} onCheckedChange={(v) => setSaveAsPreset(Boolean(v))} />
              <Label htmlFor="savePreset">Guardar como opcion rapida</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddCustom} disabled={addMutation.isPending}>
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default WaterCard;
