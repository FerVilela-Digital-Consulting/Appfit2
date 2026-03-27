import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
      await queryClient.invalidateQueries({ queryKey: ["tour_progress", user.id] });
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
      await queryClient.invalidateQueries({ queryKey: ["tour_progress", user.id] });
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
          <DialogTitle>{currentTab.title}</DialogTitle>
          <DialogDescription>{currentTab.description}</DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
          Paso {Math.max(1, totalCount)} de 8
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
