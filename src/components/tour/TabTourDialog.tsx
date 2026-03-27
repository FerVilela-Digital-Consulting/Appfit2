import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CircleHelp, Sparkles } from "lucide-react";

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

  if (!shouldOpen || !currentTab || !progress) {
    return null;
  }

  const completedCount = progress.completedTabs.length;
  const totalCount = isTourCompleted(progress) ? completedCount : completedCount + 1;

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
