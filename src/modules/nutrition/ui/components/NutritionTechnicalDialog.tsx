import { useState } from "react";
import { CircleHelp, Flame, Star } from "lucide-react";
import { Link } from "react-router-dom";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NUTRITION_ARCHETYPE_META } from "@/features/nutrition/nutritionProfiles";
import { ACTIVITY_LABELS, formatMetric, GOAL_LABELS } from "@/modules/nutrition/ui/nutritionConstants";
import type {
  NutritionGoals,
  NutritionMetabolicProfile,
  NutritionProfileRecord,
  NutritionTargetBreakdown,
} from "@/modules/nutrition/types";

type NutritionTechnicalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: NutritionTargetBreakdown | null | undefined;
  goals: NutritionGoals | null | undefined;
  metabolicProfile: NutritionMetabolicProfile | null | undefined;
  profileOptions: NutritionProfileRecord[];
  onCreateProfile: () => void;
  onEditProfile: (profile: NutritionProfileRecord) => void;
  onSetDefaultProfile: (profileId: string) => void;
  onArchiveProfile: (profileId: string) => void;
  onDeleteProfile: (profileId: string, mode?: "safe_archive" | "hard_delete_with_placeholder") => void;
  isDeletingProfile?: boolean;
};

export function NutritionTechnicalDialog({
  open,
  onOpenChange,
  target,
  goals,
  metabolicProfile,
  profileOptions,
  onCreateProfile,
  onEditProfile,
  onSetDefaultProfile,
  onArchiveProfile,
  onDeleteProfile,
  isDeletingProfile = false,
}: NutritionTechnicalDialogProps) {
  const [deleteTarget, setDeleteTarget] = useState<NutritionProfileRecord | null>(null);
  const renderCalcHint = (description: string) => (
    <TooltipProvider delayDuration={90}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="rounded-full p-0.5 text-muted-foreground/80" aria-label="Ayuda del calculo">
            <CircleHelp className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[250px] text-xs">
          {description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="app-dialog-surface max-h-[90vh] max-w-4xl overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Configuracion tecnica de nutrición</DialogTitle>
              <DialogDescription>
                Ajusta plantillas del dia, metas y base de calculo sin bloquear el flujo principal de registro diario.
              </DialogDescription>
            </DialogHeader>
          <div className="space-y-5">
          <div className="app-surface-panel rounded-[24px] p-4 sm:rounded-[28px] sm:p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-primary/80">Calculo energetico</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border app-surface-soft p-4">
                <div className="app-surface-caption inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.24em]">
                  TDEE base
                  {renderCalcHint("Gasto total diario estimado según tu perfil metabólico.")}
                </div>
                <div className="app-surface-heading mt-2 text-2xl font-black md:text-3xl">{formatMetric(target?.tdee)}</div>
                <div className="app-surface-caption text-xs">antes del arquetipo</div>
              </div>
              <div className="rounded-2xl border app-surface-soft p-4">
                <div className="app-surface-caption inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.24em]">
                  Objetivo
                  {renderCalcHint("Multiplicador por objetivo: perder, mantener o ganar peso.")}
                </div>
                <div className="app-surface-heading mt-2 text-2xl font-black md:text-3xl">
                  {target ? `x${target.goalMultiplier.toFixed(2)}` : "--"}
                </div>
                <div className="app-surface-caption text-xs">aplicado al TDEE</div>
              </div>
              <div className="rounded-2xl border app-surface-soft p-4">
                <div className="app-surface-caption inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.24em]">
                  Ajuste del dia
                  {renderCalcHint("Ajuste por plantilla del dia: Base (0), Heavy (+150), Recovery (-300).")}
                </div>
                <div className="app-surface-heading mt-2 text-2xl font-black md:text-3xl">
                  {target ? `${target.archetypeDelta >= 0 ? "+" : ""}${target.archetypeDelta}` : "--"}
                </div>
                <div className="app-surface-caption text-xs">kcal por arquetipo</div>
              </div>
            </div>
            <div className="app-surface-caption mt-4 grid gap-2 text-xs uppercase tracking-[0.2em]">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1">
                  Base objetivo
                  {renderCalcHint("Resultado de TDEE base x objetivo, antes del ajuste del dia.")}
                </span>
                <span>{formatMetric(target?.calorieTarget, " kcal")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1">
                  Meta final
                  {renderCalcHint("Formula final: (TDEE x objetivo) + ajuste del dia.")}
                </span>
                <span>{formatMetric(goals?.calorie_goal, " kcal")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Peso de calculo</span>
                <span>{formatMetric(metabolicProfile?.weightKg, " kg", 1)}</span>
              </div>
            </div>
            <div className="app-surface-caption mt-2 text-[11px] leading-relaxed">
              Formula: ({formatMetric(target?.tdee)} x {target ? target.goalMultiplier.toFixed(2) : "--"}) +{" "}
              {target ? `${target.archetypeDelta >= 0 ? "+" : ""}${target.archetypeDelta}` : "--"} ={" "}
              {formatMetric(goals?.calorie_goal, " kcal")}
            </div>
          </div>

          <div className="app-surface-panel rounded-[24px] p-4 sm:rounded-[28px] sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="app-surface-caption text-[11px] font-semibold uppercase tracking-[0.26em]">Plantillas del dia</div>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="app-surface-muted rounded-full p-1" aria-label="Ayuda plantillas del dia">
                        <CircleHelp className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[250px] text-xs">
                      <p>
                        Las plantillas de alimentacion ajustan tus calorias segun el tipo de dia: descanso (-300), esfuerzo alto (+150) o base (sin ajuste). Este ajuste se suma al calculo principal de tu Perfil Fitness.
                      </p>
                      <p className="mt-2">
                        Puedes guardar plantillas, marcar una como inicial, aplicarlas por fecha y conservar snapshots diarios para no alterar tu historial.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={onCreateProfile}
                className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
              >
                + Crear perfil
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="app-surface-soft rounded-2xl border border-border/60 px-3 py-3">
                <div className="app-surface-caption text-[10px] font-semibold uppercase tracking-[0.22em]">Leyenda de estados</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-xl border border-slate-400/30 bg-slate-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                    Automatico
                  </span>
                  <span className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    Inicial
                  </span>
                  <span className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                    Elegida
                  </span>
                  <span className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                    Archivada
                  </span>
                </div>
              </div>
              {profileOptions.length === 0 ? (
                <div className="app-panel-block app-surface-muted rounded-2xl border-dashed px-4 py-5 text-sm">
                  Crea plantillas Base, Heavy o Recovery para ajustar el dia sin duplicar comidas.
                </div>
              ) : (
                profileOptions.map((profileRow) => {
                  const profileArchetypeMeta = NUTRITION_ARCHETYPE_META[profileRow.archetype] ?? NUTRITION_ARCHETYPE_META.base;
                  return (
                    <div key={profileRow.id} className="app-panel-block rounded-2xl p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="app-surface-heading text-sm font-semibold break-words">{profileRow.name}</span>
                            {profileRow.is_default ? <Star className="h-4 w-4 text-amber-300" /> : null}
                            {profileRow.is_default ? (
                              <span className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                                Inicial
                              </span>
                            ) : (
                              <span className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                                Elegible
                              </span>
                            )}
                            {profileRow.is_archived ? (
                              <span className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                                Archivada
                              </span>
                            ) : null}
                          </div>
                          <p className="app-surface-muted mt-1 text-xs">{profileArchetypeMeta.description}</p>
                        </div>
                        <div className="app-surface-soft app-surface-muted w-fit rounded-xl px-2 py-1 text-[10px] uppercase tracking-[0.2em]">
                          {profileArchetypeMeta.shortLabel}
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onEditProfile(profileRow)}
                          className="app-outline-button w-full sm:w-auto"
                        >
                          Editar
                        </Button>
                        {!profileRow.is_default ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onSetDefaultProfile(profileRow.id)}
                            className="app-outline-button w-full sm:w-auto"
                          >
                            Inicial
                          </Button>
                        ) : null}
                        {!profileRow.is_archived ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onArchiveProfile(profileRow.id)}
                            className="app-outline-button w-full sm:w-auto"
                          >
                            Archivar
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteTarget(profileRow)}
                          className="w-full border-red-400/20 bg-transparent text-red-200 sm:w-auto"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="app-surface-panel rounded-[24px] p-4 sm:rounded-[28px] sm:p-5">
            <div className="app-surface-caption flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.26em]">
              <Flame className="h-3.5 w-3.5 text-primary" />
              Perfil metabólico
            </div>
            <div className="mt-4 grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border app-surface-soft p-3">
                  <div className="app-surface-caption text-[10px] uppercase tracking-[0.24em]">Sexo</div>
                  <div className="app-surface-heading mt-2 text-sm">{metabolicProfile?.sex === "female" ? "Femenino" : "Masculino"}</div>
                </div>
                <div className="rounded-2xl border app-surface-soft p-3">
                  <div className="app-surface-caption text-[10px] uppercase tracking-[0.24em]">Edad</div>
                  <div className="app-surface-heading mt-2 text-sm">{metabolicProfile?.age ?? "--"} años</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border app-surface-soft p-3">
                  <div className="app-surface-caption text-[10px] uppercase tracking-[0.24em]">Peso</div>
                  <div className="app-surface-heading mt-2 text-sm">{formatMetric(metabolicProfile?.weightKg, " kg", 1)}</div>
                </div>
                <div className="rounded-2xl border app-surface-soft p-3">
                  <div className="app-surface-caption text-[10px] uppercase tracking-[0.24em]">Altura</div>
                  <div className="app-surface-heading mt-2 text-sm">{formatMetric(metabolicProfile?.heightCm, " cm", 0)}</div>
                </div>
              </div>
              <div className="rounded-2xl border app-surface-soft p-3">
                <div className="app-surface-caption text-[10px] uppercase tracking-[0.24em]">Actividad</div>
                <div className="app-surface-heading mt-2 text-sm">{ACTIVITY_LABELS[metabolicProfile?.activityLevel ?? "moderate"] ?? "--"}</div>
              </div>
              <div className="rounded-2xl border app-surface-soft p-3">
                <div className="app-surface-caption text-[10px] uppercase tracking-[0.24em]">Objetivo</div>
                <div className="app-surface-heading mt-2 text-sm">{GOAL_LABELS[metabolicProfile?.goalType ?? "maintain"] ?? "--"}</div>
              </div>
              <Button asChild className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/fitness-profile">Abrir Perfil Fitness</Link>
              </Button>
            </div>
          </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(next) => !next && setDeleteTarget(null)}>
        <AlertDialogContent className="app-dialog-surface border-border/60">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar plantilla</AlertDialogTitle>
            <AlertDialogDescription>
              Si esta plantilla ya tiene historial, puedes archivarla (recomendado) o eliminarla y reemplazar su referencia por un marcador generico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="app-surface-soft rounded-2xl border border-border/60 px-3 py-3 text-sm">
            Plantilla objetivo: <span className="font-semibold">{deleteTarget?.name ?? "--"}</span>
          </div>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={isDeletingProfile}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteTarget) return;
                onDeleteProfile(deleteTarget.id, "safe_archive");
                setDeleteTarget(null);
              }}
              disabled={isDeletingProfile}
              className="bg-slate-700 text-white hover:bg-slate-600"
            >
              Archivar (recomendado)
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => {
                if (!deleteTarget) return;
                onDeleteProfile(deleteTarget.id, "hard_delete_with_placeholder");
                setDeleteTarget(null);
              }}
              disabled={isDeletingProfile}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar y reemplazar historial
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

