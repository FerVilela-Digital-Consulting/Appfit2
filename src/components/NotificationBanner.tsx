import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { listMyNotifications, markMyNotificationRead } from "@/services/notifications";
import {
  getFirstTourTab,
  TOUR_INVITE_NOTIFICATION_ID,
  TOUR_REPLAY_NOTIFICATION_ID,
  getNextIncompleteTourTab,
  getTourProgressState,
  isTourCompleted,
  markTourInviteResponded,
  restartTourProgress,
  shouldPromptTourInvite,
} from "@/services/tourProgress";

type LocalTourInviteNotification = {
  id: typeof TOUR_INVITE_NOTIFICATION_ID;
  title: string;
  body: string;
  action_path: string | null;
  action_label: string | null;
  read_at: string | null;
  isLocalTourInvite: true;
};

type LocalTourReplayNotification = {
  id: typeof TOUR_REPLAY_NOTIFICATION_ID;
  title: string;
  body: string;
  action_path: string | null;
  action_label: string | null;
  read_at: string | null;
  isLocalTourReplay: true;
};

const NotificationBanner = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isGuest } = useAuth();

  const notificationsQuery = useQuery({
    queryKey: ["user_notifications"],
    queryFn: () => listMyNotifications(10),
    enabled: Boolean(user?.id) && !isGuest,
  });
  const tourStateQuery = useQuery({
    queryKey: ["tour_progress", user?.id, isGuest],
    queryFn: () => getTourProgressState(user?.id ?? null, { isGuest }),
    enabled: Boolean(user?.id) && !isGuest,
  });

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) => markMyNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_notifications"] });
    },
  });

  const firstUnread = useMemo(
    () => (notificationsQuery.data ?? []).find((notification) => !notification.read_at) ?? null,
    [notificationsQuery.data],
  );
  const localTourInvite = useMemo<LocalTourInviteNotification | null>(() => {
    if (!user?.id || isGuest) return null;
    if (tourStateQuery.isLoading) return null;

    const tourState = tourStateQuery.data;
    if (!tourState) return null;
    if (!shouldPromptTourInvite(tourState)) return null;

    const nextTab = getNextIncompleteTourTab(tourState);
    if (!nextTab) return null;

    return {
      id: TOUR_INVITE_NOTIFICATION_ID,
      title: "¿Quieres hacer un recorrido guiado?",
      body: "Podemos mostrarte un tour rapido por cada pestaña para que conozcas la app en pocos minutos.",
      action_path: `${nextTab.route}?tour=1`,
      action_label: "Iniciar tour",
      read_at: null,
      isLocalTourInvite: true,
    };
  }, [isGuest, tourStateQuery.data, tourStateQuery.isLoading, user?.id]);
  const localTourReplay = useMemo<LocalTourReplayNotification | null>(() => {
    if (!user?.id || isGuest) return null;
    if (tourStateQuery.isLoading || !tourStateQuery.data) return null;
    if (!isTourCompleted(tourStateQuery.data)) return null;
    return {
      id: TOUR_REPLAY_NOTIFICATION_ID,
      title: "Recorrido completado",
      body: "Puedes rehacer el recorrido guiado cuando quieras para repasar cada pestaña.",
      action_path: null,
      action_label: "Rehacer recorrido",
      read_at: null,
      isLocalTourReplay: true,
    };
  }, [isGuest, tourStateQuery.data, tourStateQuery.isLoading, user?.id]);
  const unreadNotification = firstUnread ?? localTourInvite ?? localTourReplay;
  const isReplayNotification = unreadNotification?.id === TOUR_REPLAY_NOTIFICATION_ID;

  if (isGuest || !user?.id || !unreadNotification) {
    return null;
  }

  const handleAction = async () => {
    if (unreadNotification.id === TOUR_REPLAY_NOTIFICATION_ID) {
      const firstTab = getFirstTourTab();
      if (!firstTab) return;
      await restartTourProgress(user.id, { isGuest: false });
      await queryClient.invalidateQueries({ queryKey: ["tour_progress", user.id] });
      navigate(`${firstTab.route}?tour=1`);
      return;
    }

    if (unreadNotification.id === TOUR_INVITE_NOTIFICATION_ID) {
      await markTourInviteResponded(user.id, { isGuest: false });
      await queryClient.invalidateQueries({ queryKey: ["tour_progress", user.id] });
      if (unreadNotification.action_path) {
        navigate(unreadNotification.action_path);
      }
      return;
    }

    await markReadMutation.mutateAsync(unreadNotification.id);

    if (unreadNotification.action_path) {
      navigate(unreadNotification.action_path);
    }
  };

  const handleDismiss = () => {
    if (!unreadNotification || unreadNotification.id === TOUR_REPLAY_NOTIFICATION_ID) return;
    if (unreadNotification.id === TOUR_INVITE_NOTIFICATION_ID) {
      void markTourInviteResponded(user.id, { isGuest: false });
      void queryClient.invalidateQueries({ queryKey: ["tour_progress", user.id] });
      return;
    }
    markReadMutation.mutate(unreadNotification.id);
  };
  const bannerTitle = unreadNotification?.title ?? "Recorrido guiado";
  const bannerBody =
    unreadNotification?.body ??
    "Ya completaste el recorrido inicial. Puedes rehacerlo cuando quieras para refrescar cada pestaña.";
  const actionLabel = unreadNotification?.action_label ?? "Revisar";

  return (
    <div className="border-b border-primary/15 bg-primary/5 px-4 py-3 md:px-8">
      <Alert className="mx-auto max-w-7xl border-primary/20 bg-transparent">
        <BellRing className="h-4 w-4 text-primary" />
        <AlertTitle>{bannerTitle}</AlertTitle>
        <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>{bannerBody}</span>
          <div className="flex flex-wrap gap-2">
            {unreadNotification ? (
              <>
                <Button size="sm" onClick={() => void handleAction()} disabled={markReadMutation.isPending}>
                  {actionLabel}
                </Button>
                {!isReplayNotification ? (
                  <Button variant="outline" size="sm" onClick={handleDismiss} disabled={markReadMutation.isPending}>
                    Marcar leida
                  </Button>
                ) : null}
              </>
            ) : null}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default NotificationBanner;
