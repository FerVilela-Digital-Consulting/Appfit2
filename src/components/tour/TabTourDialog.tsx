import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  getTourProgressState,
  getTourTabByPath,
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
  mobileSelector?: string;
  mobileSlideIndex?: number;
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
    mobileSelector: '[data-tour="mobile-command-center"]',
    mobileSlideIndex: 0,
  },
  {
    key: "today-priority",
    title: "Qué hacer hoy",
    description:
      "Este bloque prioriza tu día: arriba ves el avance total y abajo la siguiente acción recomendada. Si completas ese paso, el progreso diario sube automáticamente.",
    selector: '[data-tour="today-action-card"]',
    mobileSlideIndex: 0,
  },
  {
    key: "mini-cards",
    title: "Tarjetas rápidas",
    description:
      "Aquí registras rápido lo esencial del día (agua, sueño, biofeedback y pasos). El botón “+” abre cada módulo en popup para guardar sin salir del centro operativo.",
    selector: '[data-tour="mini-cards-zone"]',
    mobileSlideIndex: 4,
  },
  {
    key: "biofeedback",
    title: "Biofeedback rápido",
    description:
      "Este check-in impacta tu recuperación y la recomendación de carga de entrenamiento. Puedes usar un perfil rápido o ajustar valores en detalle cuando lo necesites.",
    selector: '[data-tour="biofeedback-card"]',
    mobileSlideIndex: 4,
  },
  {
    key: "body-progress",
    title: "Progreso corporal",
    description:
      "Compara peso actual contra tu meta y revisa tendencia por periodo (7D, 30D o Todo). El objetivo es detectar dirección, no solo el número de hoy.",
    selector: '[data-tour="weight-progress-card"]',
    mobileSlideIndex: 1,
  },
  {
    key: "training",
    title: "Entrenamiento",
    description:
      "Desde aquí ves la rutina del día, minutos estimados y nivel de carga sugerido. Puedes iniciar o continuar sesión sin navegar a otra pestaña primero.",
    selector: '[data-tour="training-card"]',
    mobileSlideIndex: 2,
  },
  {
    key: "nutrition",
    title: "Nutrición",
    description:
      "Muestra el progreso de calorías frente a tu meta diaria. Si estás por debajo o por encima, aquí mismo tienes acceso directo para registrar comida.",
    selector: '[data-tour="nutrition-card"]',
    mobileSlideIndex: 3,
  },
  {
    key: "notes",
    title: "Notas del día",
    description:
      "Usa esta nota para registrar contexto útil del día (energía, molestias, decisiones). Se guarda automáticamente y luego te sirve para revisar patrones.",
    selector: '[data-tour="notes-card"]',
    mobileSlideIndex: 0,
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

const getVisibleArea = (rect: DOMRect) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const left = Math.max(0, rect.left);
  const top = Math.max(0, rect.top);
  const right = Math.min(viewportWidth, rect.right);
  const bottom = Math.min(viewportHeight, rect.bottom);
  return Math.max(0, right - left) * Math.max(0, bottom - top);
};

const resolveSelectorTarget = (selector: string, options?: { mobileSlideIndex?: number | null }): HTMLElement | null => {
  const { mobileSlideIndex = null } = options ?? {};
  const selectors = selector.split(",").map((item) => item.trim()).filter(Boolean);
  let searchRoot: ParentNode = document;
  if (typeof mobileSlideIndex === "number") {
    const slide = document.querySelector(`[data-tour-slide="${mobileSlideIndex}"]`);
    if (slide) {
      searchRoot = slide;
    }
  }

  for (const currentSelector of selectors) {
    const localNodes = Array.from(searchRoot.querySelectorAll(currentSelector));
    const fallbackNodes = searchRoot === document ? [] : Array.from(document.querySelectorAll(currentSelector));
    const nodes = [...localNodes, ...fallbackNodes];
    let bestNode: HTMLElement | null = null;
    let bestVisibleArea = 0;
    for (const node of nodes) {
      if (node instanceof HTMLElement && isElementVisible(node)) {
        const visibleArea = getVisibleArea(node.getBoundingClientRect());
        if (visibleArea > bestVisibleArea) {
          bestVisibleArea = visibleArea;
          bestNode = node;
        }
      }
    }
    if (bestNode) return bestNode;
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
  const isMobile = useIsMobile();
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
  const shouldOpen = Boolean(user?.id) && !isGuest && isTourActive && currentTab?.key === "today";
  const isTodayTour = currentTab?.key === "today";
  const [todayStepIndex, setTodayStepIndex] = useState(0);
  const [panelDirection, setPanelDirection] = useState<1 | -1>(1);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const activeTodayStep = TODAY_TOUR_STEPS[todayStepIndex] ?? null;
  const activeSelector = useMemo(() => {
    if (!activeTodayStep) return null;
    return isMobile && activeTodayStep.mobileSelector ? activeTodayStep.mobileSelector : activeTodayStep.selector;
  }, [activeTodayStep, isMobile]);

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

  const completeTodayTourMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !currentTab) return null;
      return markTourTabCompleted(user.id, currentTab.key, { isGuest: false });
    },
    onSuccess: async () => {
      if (!user?.id) return;
      await queryClient.invalidateQueries({ queryKey: ["tour_progress", user.id, isGuest] });
      closeTourQuery();
      toast.success("Recorrido de centro operativo completado.");
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

  useEffect(() => {
    if (!shouldOpen || !isTodayTour) return;
    setTodayStepIndex(0);
    setPanelDirection(1);
  }, [isTodayTour, location.pathname, shouldOpen]);

  useEffect(() => {
    if (!user?.id || isGuest || !isTourActive) return;
    if (currentTab && currentTab.key !== "today") {
      navigate("/today?tour=1", { replace: true });
    }
  }, [currentTab, isGuest, isTourActive, navigate, user?.id]);

  useEffect(() => {
    if (!shouldOpen || !isTodayTour || !activeTodayStep) {
      return;
    }

    if (!isMobile || typeof activeTodayStep.mobileSlideIndex !== "number") {
      return;
    }

    const carousel = document.querySelector("[data-tour-mobile-carousel]");
    if (!(carousel instanceof HTMLElement)) return;
    const slide = carousel.querySelector(`[data-tour-slide="${activeTodayStep.mobileSlideIndex}"]`);
    if (!(slide instanceof HTMLElement)) return;

    const nextLeft = slide.offsetLeft - Math.max(0, (carousel.clientWidth - slide.clientWidth) / 2);
    carousel.scrollTo({ left: Math.max(0, nextLeft), behavior: "smooth" });
  }, [activeTodayStep, isMobile, isTodayTour, shouldOpen]);

  useEffect(() => {
    if (!shouldOpen || !isTodayTour || !activeTodayStep || !activeSelector) {
      setHighlightRect(null);
      return;
    }

    let frameId = 0;
    let timerId: number | null = null;
    const updateRect = () => {
      const targetNode = resolveSelectorTarget(activeSelector, {
        mobileSlideIndex: isMobile ? activeTodayStep.mobileSlideIndex ?? null : null,
      });
      setHighlightRect(targetNode ? targetNode.getBoundingClientRect() : null);
    };
    const scheduleUpdate = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateRect);
    };

    scheduleUpdate();
    timerId = window.setTimeout(scheduleUpdate, 260);
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, true);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      if (timerId !== null) window.clearTimeout(timerId);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate, true);
    };
  }, [activeSelector, activeTodayStep, isMobile, isTodayTour, shouldOpen]);

  const handleTodayBack = () => {
    setPanelDirection(-1);
    setTodayStepIndex((current) => Math.max(0, current - 1));
  };

  const handleTodayNext = () => {
    if (!activeTodayStep) return;
    const isLastStep = todayStepIndex >= TODAY_TOUR_STEPS.length - 1;
    if (isLastStep) {
      if (!completeTodayTourMutation.isPending) {
        completeTodayTourMutation.mutate();
      }
      return;
    }
    setPanelDirection(1);
    setTodayStepIndex((current) => Math.min(TODAY_TOUR_STEPS.length - 1, current + 1));
  };

  if (!shouldOpen || !currentTab || !progress) {
    return null;
  }

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
            <motion.div className="absolute inset-0 bg-background/65" />

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
                  opacity: [0.86, 1, 0.86],
                  scale: [1, 1.012, 1],
                }}
                transition={{
                  top: { duration: 0.22, ease: "easeOut" },
                  left: { duration: 0.22, ease: "easeOut" },
                  width: { duration: 0.22, ease: "easeOut" },
                  height: { duration: 0.22, ease: "easeOut" },
                  opacity: { duration: 1.7, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 1.7, repeat: Infinity, ease: "easeInOut" },
                }}
                style={{ boxShadow: "0 0 0 1px hsl(var(--primary) / 0.32), 0 0 18px hsl(var(--primary) / 0.26)" }}
              />
            ) : null}

            <motion.div
              key={`today-tour-panel-${activeTodayStep.key}`}
              className="fixed z-[92] w-[min(92vw,380px)] rounded-2xl border border-border/70 bg-card/95 p-4 shadow-2xl"
              initial={{ opacity: 0, y: 8, x: panelDirection * 22, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1, top: todayPanelPosition.top, left: todayPanelPosition.left }}
              exit={{ opacity: 0, y: 6, x: panelDirection * -14, scale: 0.99 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
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
                  <Button type="button" onClick={handleTodayNext} disabled={completeTodayTourMutation.isPending}>
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
  return null;
};

export default TabTourDialog;
