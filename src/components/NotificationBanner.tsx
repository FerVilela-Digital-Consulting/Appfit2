import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { listMyNotifications, markMyNotificationRead } from "@/services/notifications";
import {
  TOUR_INVITE_NOTIFICATION_ID,
  getNextIncompleteTourTab,
  getTourProgressState,
  markTourInviteResponded,
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
  const unreadNotification = firstUnread ?? localTourInvite;

  if (isGuest || !user?.id || !unreadNotification) {
    return null;
  }

  const handleAction = async () => {
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
    if (unreadNotification.id === TOUR_INVITE_NOTIFICATION_ID) {
      void markTourInviteResponded(user.id, { isGuest: false });
      void queryClient.invalidateQueries({ queryKey: ["tour_progress", user.id] });
      return;
    }
    markReadMutation.mutate(unreadNotification.id);
  };

  return (
    <div className="border-b border-primary/15 bg-primary/5 px-4 py-3 md:px-8">
      <Alert className="mx-auto max-w-7xl border-primary/20 bg-transparent">
        <BellRing className="h-4 w-4 text-primary" />
        <AlertTitle>{unreadNotification.title}</AlertTitle>
        <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>{unreadNotification.body}</span>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => void handleAction()} disabled={markReadMutation.isPending}>
              {unreadNotification.action_label ?? "Revisar"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDismiss} disabled={markReadMutation.isPending}>
              Marcar leida
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default NotificationBanner;
