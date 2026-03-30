import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { CircleHelp, Sparkles, X } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  getNextIncompleteTourTab,
  getTourProgressState,
  getTourTabByPath,
  isTourCompleted,
  markTourInviteResponded,
  markTourTabCompleted,
} from "@/services/tourProgress";

const TOUR_QUERY_KEY = "tour";
const TODAY_STEP_COUNT = 11;

type TodayTourStep = {
  key: string;
  title: string;
  description: string;
  selector: string;
};

const TODAY_TOUR_STEPS: TodayTourStep[] = [
  {
    key: "welcome",
    title: "Bienvenido al recorrido",
    description: "En menos de un minuto verás cómo moverte por tu centro operativo y registrar tu día sin fricción.",
    selector: '[data-tour="hero-intro"]',
  },
  {
    key: "navigation",
    title: "Navegación principal",
    description: "Desde esta zona puedes cambiar de sección y mantener el control diario de forma rápida.",
    selector: '[data-tour="sidebar-nav"], [data-tour="mobile-bottom-nav"]',
  },
  {
    key: "command-center",
    title: "Centro operativo",
    description: "Aquí se concentra tu flujo del día: prioridad, registros rápidos y estado global.",
    selector: '[data-tour="actions-zone"]',
  },
  {
    key: "today-priority",
    title: "Qué hacer hoy",
    description: "Este bloque te muestra tu siguiente acción y lo que falta para cerrar el día.",
    selector: '[data-tour="today-action-card"]',
  },
  {
    key: "mini-cards",
    title: "Tarjetas rápidas",
    description: "Agua, sueño, biofeedback y pasos se actualizan aquí para registrar sin cambiar de pantalla.",
    selector: '[data-tour="mini-cards-zone"]',
  },
  {
    key: "biofeedback",
    title: "Biofeedback rápido",
    description: "Desde esta tarjeta registras cómo te sientes hoy y alimentas el cálculo de recuperación.",
    selector: '[data-tour="biofeedback-card"]',
  },
  {
    key: "body-progress",
    title: "Progreso corporal",
    description: "Compara peso actual, meta y tendencia por rango (7D, 30D o Todo).",
    selector: '[data-tour="weight-progress-card"]',
  },
  {
    key: "training",
    title: "Entrenamiento",
    description: "Consulta rutina del día y entra directo a la sesión desde este bloque.",
    selector: '[data-tour="training-card"]',
  },
  {
    key: "nutrition",
    title: "Nutrición",
    description: "Revisa consumo frente a objetivo y registra comidas en un toque.",
    selector: '[data-tour="nutrition-card"]',
  },
  {
    key: "notes",
    title: "Notas del día",
    description: "Escribe aquí observaciones rápidas. Se guardan automáticamente para tu contexto diario.",
    selector: '[data-tour="notes-card"]',
  },
  {
    key: "tour-reopen",
    title: "Reabrir el recorrido",
    description: "Cuando quieras repetirlo, entra a Notificaciones y usa la opción de Recorrido.",
    selector: '[data-tour="notifications-center"]',
  },
];

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const isElementVisible = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return rect.width > 1 && rect.height > 1 && style.visibility !== "hidden" && style.display !== "none";
};

const resolveSelectorTarget = (selector: string): HTMLElement | null => {
  const selectors = selector.split(",").map((item) => item.trim()).filter(Boolean);
  for (const currentSelector of selectors) {
    const nodes = document.querySelectorAll(currentSelector);
    for (const node of nodes) {
      if (node instanceof HTMLElement && isElementVisible(node)) {
        return node;
      }
    }
  }
  return null;
};

const getPanelPosition = (targetRect: DOMRect | null) => {
  const panelWidth = 380;
  const panelHeight = 260;
  const margin = 16;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (!targetRect) {
    return {
      top: Math.max(margin, Math.round((viewportHeight - panelHeight) / 2)),
      left: Math.max(margin, Math.round((viewportWidth - panelWidth) / 2)),
    };
  }

  const belowTop = targetRect.bottom + margin;
  const aboveTop = targetRect.top - panelHeight - margin;
  const preferredTop = belowTop + panelHeight <= viewportHeight - margin ? belowTop : aboveTop;
  const fallbackTop = clamp(targetRect.top + targetRect.height / 2 - panelHeight / 2, margin, viewportHeight - panelHeight - margin);
  const top = preferredTop >= margin ? preferredTop : fallbackTop;
  const left = clamp(targetRect.left + targetRect.width / 2 - panelWidth / 2, margin, viewportWidth - panelWidth - margin);

  return { top: Math.round(top), left: Math.round(left) };
};

const TabTourDialog = () => {
  const { user, isGuest } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isTourActive = new URLSearchParams(location.search).get(TOUR_QUERY_KEY) === "1";

  const tourStateQuery = useQuery({
    queryKey: ["tour_progress", user?.id, isGuest],
    queryFn: () => getTourProgressState(user?.id ?? null, { isGuest }),
    enabled: Boolean(user?.id) && !isGuest,
  });

  const currentTab = useMemo(() => getTourTabByPath(location.pathname), [location.pathname]);
  const progress = tourStateQuery.data;
  const shouldOpen = Boolean(user?.id) && !isGuest && isTourActive && Boolean(currentTab);
  const isTodayTour = currentTab?.key === "today";
  const [todayStepIndex, setTodayStepIndex] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const activeTodayStep = TODAY_TOUR_STEPS[todayStepIndex] ?? null;

  const skipTourMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      await markTourInviteResponded(user.id, { isGuest: false });
    },
    onSuccess: async () => {
      if (!user?.id) return;
      await queryClient.invalidateQueries({ queryKey: ["tour_progress", user.id, isGuest] });
      closeTourQuery();
      toast.info("Tour pausado. Puedes retomarlo cuando quieras.");
    },
  });

  const completeTabMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !currentTab) return null;
      return markTourTabCompleted(user.id, currentTab.key, { isGuest: false });
    },
    onSuccess: async (nextState) => {
      if (!user?.id) return;
      await queryClient.invalidateQueries({ queryKey: ["tour_progress", user.id, isGuest] });
      if (!nextState) return;

      const nextTab = getNextIncompleteTourTab(nextState);
      if (!nextTab) {
        closeTourQuery();
        toast.success("Recorrido completado.");
        return;
      }

      navigate(`${nextTab.route}?tour=1`);
    },
  });

  const closeTourQuery = () => {
    const params = new URLSearchParams(location.search);
    params.delete(TOUR_QUERY_KEY);
    navigate(
      {
        pathname: location.pathname,
        search: params.toString() ? `?${params.toString()}` : "",
      },
      { replace: true },
    );
  };

  const handleSkipTour = () => {
    if (!user?.id || skipTourMutation.isPending) return;
    skipTourMutation.mutate();
  };

  const handleCompleteTab = () => {
    if (!user?.id || !currentTab || completeTabMutation.isPending) return;
    completeTabMutation.mutate();
  };

  useEffect(() => {
    if (!shouldOpen || !isTodayTour) return;
    setTodayStepIndex(0);
  }, [isTodayTour, location.pathname, shouldOpen]);

  useEffect(() => {
    if (!shouldOpen || !isTodayTour || !activeTodayStep) {
      setHighlightRect(null);
      return;
    }

    let frameId = 0;
    const updateRect = () => {
      const targetNode = resolveSelectorTarget(activeTodayStep.selector);
      setHighlightRect(targetNode ? targetNode.getBoundingClientRect() : null);
    };
    const scheduleUpdate = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateRect);
    };

    scheduleUpdate();
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, true);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate, true);
    };
  }, [activeTodayStep, isTodayTour, shouldOpen]);

  const handleTodayBack = () => {
    setTodayStepIndex((current) => Math.max(0, current - 1));
  };

  const handleTodayNext = () => {
    if (!activeTodayStep) return;
    const isLastStep = todayStepIndex >= TODAY_TOUR_STEPS.length - 1;
    if (isLastStep) {
      handleCompleteTab();
      return;
    }
    setTodayStepIndex((current) => Math.min(TODAY_TOUR_STEPS.length - 1, current + 1));
  };

  if (!shouldOpen || !currentTab || !progress) {
    return null;
  }

  const completedCount = progress.completedTabs.length;
  const totalCount = isTourCompleted(progress) ? completedCount : completedCount + 1;
  const todayPanelPosition = getPanelPosition(highlightRect);
  const canGoBackToday = todayStepIndex > 0;
  const isLastTodayStep = todayStepIndex >= TODAY_TOUR_STEPS.length - 1;

  if (isTodayTour && activeTodayStep) {
    return (
      <AnimatePresence>
        {shouldOpen ? (
          <motion.div
            key="today-tour-overlay"
            className="fixed inset-0 z-[90]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-background/70 backdrop-blur-[1px]" />

            {highlightRect ? (
              <motion.div
                key={`today-tour-highlight-${activeTodayStep.key}`}
                className="pointer-events-none absolute rounded-2xl border-2 border-primary"
                initial={false}
                animate={{
                  top: highlightRect.top - 8,
                  left: highlightRect.left - 8,
                  width: highlightRect.width + 16,
                  height: highlightRect.height + 16,
                  boxShadow: [
                    "0 0 0 1px hsl(var(--primary) / 0.15), 0 0 0 0 hsl(var(--primary) / 0.18)",
                    "0 0 0 1px hsl(var(--primary) / 0.35), 0 0 28px 4px hsl(var(--primary) / 0.28)",
                    "0 0 0 1px hsl(var(--primary) / 0.15), 0 0 0 0 hsl(var(--primary) / 0.18)",
                  ],
                }}
                transition={{
                  top: { duration: 0.22, ease: "easeOut" },
                  left: { duration: 0.22, ease: "easeOut" },
                  width: { duration: 0.22, ease: "easeOut" },
                  height: { duration: 0.22, ease: "easeOut" },
                  boxShadow: { duration: 2.1, repeat: Infinity, ease: "easeInOut" },
                }}
              />
            ) : null}

            <motion.div
              key={`today-tour-panel-${activeTodayStep.key}`}
              className="fixed z-[92] w-[min(92vw,380px)] rounded-2xl border border-border/70 bg-card/95 p-4 shadow-2xl backdrop-blur"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1, top: todayPanelPosition.top, left: todayPanelPosition.left }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Paso {todayStepIndex + 1} de {TODAY_STEP_COUNT}
                  </p>
                  <p className="mt-1 text-lg font-black leading-tight">{activeTodayStep.title}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full"
                  onClick={handleSkipTour}
                  aria-label="Cerrar tour"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{activeTodayStep.description}</p>

              <div className="mt-4 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={false}
                    animate={{ width: `${((todayStepIndex + 1) / TODAY_STEP_COUNT) * 100}%` }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {todayStepIndex + 1}/{TODAY_STEP_COUNT}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <Button type="button" variant="outline" onClick={handleTodayBack} disabled={!canGoBackToday}>
                  Atrás
                </Button>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" onClick={handleSkipTour}>
                    Omitir
                  </Button>
                  <Button type="button" onClick={handleTodayNext}>
                    {isLastTodayStep ? "Finalizar" : "Siguiente"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    );
  }

  return (
    <Dialog open={shouldOpen} onOpenChange={(open) => !open && handleSkipTour()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {currentTab.title}
          </DialogTitle>
          <DialogDescription>{currentTab.description}</DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
          Paso {Math.max(1, totalCount)} de 8
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Herramientas de esta pestaña</p>
          <div className="grid gap-2">
            {currentTab.tools.map((tool) => (
              <div key={`${currentTab.key}-${tool.title}`} className="rounded-xl border border-border/60 bg-background/60 px-3 py-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{tool.title}</p>
                    <p className="text-xs text-muted-foreground">{tool.summary}</p>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                        <CircleHelp className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent side="left" align="start" className="w-72">
                      <p className="text-sm font-semibold">{tool.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{tool.detail}</p>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={handleSkipTour}>
            Omitir tour
          </Button>
          <Button type="button" onClick={handleCompleteTab}>
            Completar y continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TabTourDialog;
