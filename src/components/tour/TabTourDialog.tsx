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
const SUPPORTED_TOUR_KEYS = ["today", "training", "nutrition"] as const;
type GuidedTourKey = (typeof SUPPORTED_TOUR_KEYS)[number];

type GuidedTourStep = {
  key: string;
  title: string;
  description: string;
  selector: string;
  mobileSelector?: string;
  mobileSlideIndex?: number;
  activateSelector?: string;
};

const GUIDED_TOUR_STEPS: Record<GuidedTourKey, GuidedTourStep[]> = {
  today: [
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
  ],
  training: [
    {
      key: "welcome",
      title: "Bienvenido a Entrenamiento",
      description: "Aqui gestionas todo el ciclo: ejecutar sesion, planificar rutinas y revisar progreso.",
      selector: '[data-tour="training-hero"]',
    },
    {
      key: "tabs",
      title: "Navegacion interna",
      description: "Estas pestañas separan la operacion diaria en Entrenar, Planificar, Biblioteca y Progreso.",
      selector: '[data-tour="training-tabs"]',
    },
    {
      key: "train",
      title: "Entrenar",
      description: "Aqui inicias o continuas la sesion del dia y registras series, repeticiones y notas.",
      selector: '[data-tour="training-train-focus"]',
      activateSelector: '[data-tour="training-tab-train"]',
    },
    {
      key: "plan",
      title: "Planificar",
      description: "Define la estructura semanal de rutinas y asigna que toca en cada dia.",
      selector: '[data-tour="training-plan-focus"]',
      activateSelector: '[data-tour="training-tab-plan"]',
    },
    {
      key: "routines",
      title: "Rutinas",
      description: "Crea, edita, duplica y elimina rutinas para mantener tu biblioteca operativa.",
      selector: '[data-tour="training-routines-focus"]',
      activateSelector: '[data-tour="training-tab-plan"]',
    },
    {
      key: "library",
      title: "Biblioteca de ejercicios",
      description: "Aqui agregas ejercicios personalizados y ajustas filtros para planificar mas rapido.",
      selector: '[data-tour="training-library-focus"]',
      activateSelector: '[data-tour="training-tab-library"]',
    },
    {
      key: "progress",
      title: "Progreso",
      description: "Revisa PRs, evolucion por ejercicio e historial para decidir siguientes ajustes.",
      selector: '[data-tour="training-progress-focus"]',
      activateSelector: '[data-tour="training-tab-progress"]',
    },
    {
      key: "tour-reopen",
      title: "Reabrir este recorrido",
      description: "Desde Notificaciones podras reiniciar el recorrido de Entrenamiento cuando quieras.",
      selector: '[data-tour="notifications-center"]',
    },
  ],
  nutrition: [
    {
      key: "welcome",
      title: "Bienvenido a Alimentacion",
      description: "Esta vista integra plan, registro diario y biblioteca para que la adherencia sea simple.",
      selector: '[data-tour="nutrition-hero"]',
    },
    {
      key: "switcher",
      title: "Selector de vistas",
      description: "Desde aqui alternas entre Resumen, Logbook y Biblioteca segun la tarea que necesites.",
      selector: '[data-tour="nutrition-view-switch"]',
    },
    {
      key: "header",
      title: "Contexto del dia",
      description: "Controla fecha, perfil activo y fuente del plan para saber exactamente con que objetivo trabajas hoy.",
      selector: '[data-tour="nutrition-header-focus"]',
      activateSelector: '[data-tour="nutrition-view-summary"]',
    },
    {
      key: "daily-profile",
      title: "Perfiles diarios nutricionales",
      description:
        "Aqui eliges la plantilla nutricional del dia y puedes aplicar plan semanal. Si presionas el boton '?' veras mas detalles del funcionamiento y calculo en cards clave.",
      selector: '[data-tour="nutrition-daily-profile"]',
      activateSelector: '[data-tour="nutrition-view-summary"]',
    },
    {
      key: "summary",
      title: "Resumen nutricional",
      description: "Este panel compara calorias y macros consumidos contra tu meta diaria en tiempo real.",
      selector: '[data-tour="nutrition-summary-focus"]',
      activateSelector: '[data-tour="nutrition-view-summary"]',
    },
    {
      key: "logbook",
      title: "Logbook",
      description: "Aqui registras comidas por bloque y ajustas entradas del dia sin salir de la pestaña.",
      selector: '[data-tour="nutrition-logbook-focus"]',
      activateSelector: '[data-tour="nutrition-view-logbook"]',
    },
    {
      key: "library",
      title: "Biblioteca",
      description: "Usa alimentos guardados y favoritos para acelerar el registro y reducir friccion.",
      selector: '[data-tour="nutrition-library-focus"]',
      activateSelector: '[data-tour="nutrition-view-library"]',
    },
    {
      key: "tour-reopen",
      title: "Reabrir este recorrido",
      description: "Desde Notificaciones podras iniciar de nuevo el recorrido de Alimentacion.",
      selector: '[data-tour="notifications-center"]',
    },
  ],
};

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

const resolveAnySelectorTarget = (selector: string): HTMLElement | null => {
  const selectors = selector
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  for (const currentSelector of selectors) {
    const node = document.querySelector(currentSelector);
    if (node instanceof HTMLElement) {
      return node;
    }
  }
  return null;
};

const resolveTrainingTabFromStep = (step: GuidedTourStep | null) => {
  if (!step) return null;
  if (step.key === "train") return "train";
  if (step.key === "plan" || step.key === "routines") return "plan";
  if (step.key === "library") return "library";
  if (step.key === "progress") return "progress";
  return null;
};

const getSafeViewportBounds = (isMobile: boolean) => {
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const headerNode = document.querySelector("header");
  const mobileNavNode = document.querySelector('nav[aria-label="Navegacion principal movil"]');
  const headerBottom = headerNode instanceof HTMLElement ? headerNode.getBoundingClientRect().bottom : 0;
  const mobileNavHeight =
    isMobile && mobileNavNode instanceof HTMLElement ? Math.max(0, mobileNavNode.getBoundingClientRect().height) : 0;

  const top = clamp(Math.round(headerBottom + 8), 0, Math.max(0, viewportHeight - 120));
  const bottom = clamp(
    Math.round(viewportHeight - mobileNavHeight - (isMobile ? 10 : 8)),
    Math.min(viewportHeight, top + 120),
    viewportHeight,
  );

  return {
    top,
    bottom,
    left: 8,
    right: viewportWidth - 8,
  };
};

const clampRectToSafeBounds = (rect: DOMRect, bounds: { top: number; bottom: number; left: number; right: number }) => {
  const top = clamp(rect.top, bounds.top, bounds.bottom);
  const bottom = clamp(rect.bottom, bounds.top, bounds.bottom);
  const left = clamp(rect.left, bounds.left, bounds.right);
  const right = clamp(rect.right, bounds.left, bounds.right);
  const clampedHeight = bottom - top;
  const clampedWidth = right - left;
  if (clampedHeight < 6 || clampedWidth < 6) return null;

  const safeHeight = bounds.bottom - bounds.top;
  const maxHeight = Math.min(safeHeight * 0.58, window.innerWidth < 768 ? 220 : 300);
  const limitedHeight = Math.min(clampedHeight, maxHeight);

  return {
    top,
    left,
    width: clampedWidth,
    height: limitedHeight,
  };
};

const findScrollableAncestor = (element: HTMLElement, axis: "x" | "y") => {
  const isY = axis === "y";
  let current = element.parentElement;
  while (current) {
    const style = window.getComputedStyle(current);
    const overflow = isY ? style.overflowY : style.overflowX;
    const canScroll = overflow === "auto" || overflow === "scroll";
    const hasScrollableSpace = isY ? current.scrollHeight > current.clientHeight : current.scrollWidth > current.clientWidth;
    if (canScroll && hasScrollableSpace) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
};

const scrollTargetIntoViewSoft = (target: HTMLElement, isMobile: boolean) => {
  const bounds = getSafeViewportBounds(isMobile);
  const rect = target.getBoundingClientRect();
  const verticalVisible = rect.top >= bounds.top + 10 && rect.bottom <= bounds.bottom - 10;
  const horizontalVisible = rect.left >= bounds.left + 8 && rect.right <= bounds.right - 8;

  if (!verticalVisible) {
    const ancestorY = findScrollableAncestor(target, "y");
    if (ancestorY) {
      const ancestorRect = ancestorY.getBoundingClientRect();
      const targetTopInAncestor = rect.top - ancestorRect.top + ancestorY.scrollTop;
      const nextTop = Math.max(0, targetTopInAncestor - (isMobile ? 18 : 14));
      ancestorY.scrollTo({ top: nextTop, behavior: "smooth" });
    } else {
      const nextY = Math.max(0, window.scrollY + rect.top - bounds.top - 14);
      window.scrollTo({ top: nextY, behavior: "smooth" });
    }
  }

  if (!horizontalVisible) {
    const ancestorX = findScrollableAncestor(target, "x");
    if (ancestorX) {
      const ancestorRect = ancestorX.getBoundingClientRect();
      const targetLeftInAncestor = rect.left - ancestorRect.left + ancestorX.scrollLeft;
      const nextLeft = Math.max(0, targetLeftInAncestor - 12);
      ancestorX.scrollTo({ left: nextLeft, behavior: "smooth" });
    }
  }
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
  const currentTourKey: GuidedTourKey | null = useMemo(() => {
    if (!currentTab) return null;
    return SUPPORTED_TOUR_KEYS.includes(currentTab.key as GuidedTourKey) ? (currentTab.key as GuidedTourKey) : null;
  }, [currentTab]);
  const activeSteps = currentTourKey ? GUIDED_TOUR_STEPS[currentTourKey] : [];
  const totalStepCount = activeSteps.length;
  const shouldOpen = Boolean(user?.id) && !isGuest && isTourActive && Boolean(currentTourKey);
  const isTodayTour = currentTourKey === "today";
  const [todayStepIndex, setTodayStepIndex] = useState(0);
  const [panelDirection, setPanelDirection] = useState<1 | -1>(1);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const activeTodayStep = activeSteps[todayStepIndex] ?? null;
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
      if (!user?.id || !currentTourKey) return null;
      return markTourTabCompleted(user.id, currentTourKey, { isGuest: false });
    },
    onSuccess: async () => {
      if (!user?.id) return;
      await queryClient.invalidateQueries({ queryKey: ["tour_progress", user.id, isGuest] });
      closeTourQuery();
      toast.success(`Recorrido de ${currentTab?.title ?? "esta pestaña"} completado.`);
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
    if (!shouldOpen || !currentTourKey) return;
    setTodayStepIndex(0);
    setPanelDirection(1);
  }, [currentTourKey, location.pathname, shouldOpen]);

  useEffect(() => {
    if (!user?.id || isGuest || !isTourActive) return;
    if (!currentTourKey) {
      navigate("/today?tour=1", { replace: true });
    }
  }, [currentTourKey, isGuest, isTourActive, navigate, user?.id]);

  useEffect(() => {
    if (!shouldOpen || !activeTodayStep) return;

    if (currentTourKey === "training") {
      const forcedTab = resolveTrainingTabFromStep(activeTodayStep);
      if (forcedTab) {
        const nextParams = new URLSearchParams(location.search);
        if (nextParams.get("tab") !== forcedTab) {
          nextParams.set("tab", forcedTab);
          navigate(
            {
              pathname: location.pathname,
              search: `?${nextParams.toString()}`,
            },
            { replace: true },
          );
          return;
        }
      }
    }

    if (!activeTodayStep.activateSelector) return;
    const node = resolveSelectorTarget(activeTodayStep.activateSelector) ?? resolveAnySelectorTarget(activeTodayStep.activateSelector);
    if (node) {
      scrollTargetIntoViewSoft(node, isMobile);
      window.setTimeout(() => node.click(), 140);
    }
  }, [activeTodayStep, currentTourKey, isMobile, location.pathname, location.search, navigate, shouldOpen]);

  useEffect(() => {
    if (!shouldOpen || !activeTodayStep) {
      return;
    }

    if (!isMobile || !isTodayTour || typeof activeTodayStep.mobileSlideIndex !== "number") {
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
    if (!shouldOpen || !activeTodayStep || !activeSelector) return;
    const scrollToTarget = () => {
      const targetNode =
        resolveSelectorTarget(activeSelector, {
          mobileSlideIndex: activeTodayStep.mobileSlideIndex ?? null,
        }) ?? resolveAnySelectorTarget(activeSelector);
      if (!targetNode) return;
      scrollTargetIntoViewSoft(targetNode, isMobile);
    };

    scrollToTarget();
    const timerId = window.setTimeout(scrollToTarget, 220);
    return () => window.clearTimeout(timerId);
  }, [activeSelector, activeTodayStep, isMobile, shouldOpen]);

  useEffect(() => {
    if (!shouldOpen || !activeTodayStep || !activeSelector) {
      setHighlightRect(null);
      return;
    }

    let frameId = 0;
    let timerId: number | null = null;
    const updateRect = () => {
      const targetNode = resolveSelectorTarget(activeSelector, {
        mobileSlideIndex: isMobile ? activeTodayStep.mobileSlideIndex ?? null : null,
      });
      if (!targetNode) {
        setHighlightRect(null);
        return;
      }
      const safeBounds = getSafeViewportBounds(isMobile);
      const clampedRect = clampRectToSafeBounds(targetNode.getBoundingClientRect(), safeBounds);
      setHighlightRect(clampedRect ? new DOMRect(clampedRect.left, clampedRect.top, clampedRect.width, clampedRect.height) : null);
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
  }, [activeSelector, activeTodayStep, isMobile, shouldOpen]);

  const handleTodayBack = () => {
    setPanelDirection(-1);
    setTodayStepIndex((current) => Math.max(0, current - 1));
  };

  const handleTodayNext = () => {
    if (!activeTodayStep) return;
    const isLastStep = todayStepIndex >= totalStepCount - 1;
    if (isLastStep) {
      if (!completeTodayTourMutation.isPending) {
        completeTodayTourMutation.mutate();
      }
      return;
    }
    setPanelDirection(1);
    setTodayStepIndex((current) => Math.min(totalStepCount - 1, current + 1));
  };

  if (!shouldOpen || !currentTab || !progress) {
    return null;
  }

  const todayPanelPosition = getPanelPosition(highlightRect);
  const canGoBackToday = todayStepIndex > 0;
  const isLastTodayStep = todayStepIndex >= totalStepCount - 1;

  if (activeTodayStep) {
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
              className="fixed z-[92] w-[min(92vw,380px)] rounded-2xl border border-border/70 bg-card/95 p-4 shadow-2xl"
              initial={{ opacity: 0, y: 8, x: panelDirection * 22, scale: 0.985 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                top: todayPanelPosition.top,
                left: todayPanelPosition.left,
              }}
              exit={{ opacity: 0, y: 6, x: panelDirection * -14, scale: 0.99 }}
              transition={{
                opacity: { duration: 0.18, ease: "easeOut" },
                y: { duration: 0.22, ease: "easeOut" },
                scale: { duration: 0.22, ease: "easeOut" },
                top: { type: "spring", stiffness: 220, damping: 28, mass: 0.7 },
                left: { type: "spring", stiffness: 220, damping: 28, mass: 0.7 },
              }}
            >
              <motion.div
                key={`today-tour-content-${activeTodayStep.key}`}
                initial={{ opacity: 0.35 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="flex items-start justify-between gap-3"
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Paso {todayStepIndex + 1} de {totalStepCount}
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
              </motion.div>
              <p className="mt-3 text-sm text-muted-foreground">{activeTodayStep.description}</p>

              <div className="mt-4 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={false}
                    animate={{ width: `${((todayStepIndex + 1) / totalStepCount) * 100}%` }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {todayStepIndex + 1}/{totalStepCount}
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
