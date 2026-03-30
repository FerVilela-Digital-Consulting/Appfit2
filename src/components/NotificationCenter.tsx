import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Bell, CheckCheck, ChevronDown, CircleAlert, Info, Send } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { listMyNotifications, markAllMyNotificationsRead, markMyNotificationRead, type UserNotification } from "@/services/notifications";
import {
  TOUR_CONTINUE_NOTIFICATION_ID,
  TOUR_INVITE_NOTIFICATION_ID,
  TOUR_REPLAY_NOTIFICATION_ID,
  getFirstTourTab,
  getNextIncompleteTourTab,
  getTourProgressLocalSnapshot,
  getTourProgressState,
  getTourTabByPath,
  isTourNotificationRead,
  isTourCompleted,
  markTourNotificationRead,
  markTourInviteResponded,
  restartTourProgress,
  shouldPromptTourInvite,
  type TourTabDefinition,
} from "@/services/tourProgress";

const severityMeta: Record<UserNotification["severity"], { label: string; icon: typeof Info }> = {
  info: { label: "Info", icon: Info },
  warning: { label: "Acción pendiente", icon: CircleAlert },
  action: { label: "Importante", icon: Send },
};

type LocalTourNotification = {
  id: typeof TOUR_INVITE_NOTIFICATION_ID | typeof TOUR_REPLAY_NOTIFICATION_ID | typeof TOUR_CONTINUE_NOTIFICATION_ID;
  notification_kind: "general";
  title: string;
  body: string;
  action_path: string | null;
  action_label: string | null;
  severity: "info" | "warning" | "action";
  metadata: Record<string, string | number | boolean | null>;
  sender_user_id: null;
  sender_email: null;
  read_at: null;
  created_at: string | null;
};

const isLocalTourNotification = (notification: UserNotification | LocalTourNotification): notification is LocalTourNotification =>
  notification.id === TOUR_INVITE_NOTIFICATION_ID ||
  notification.id === TOUR_REPLAY_NOTIFICATION_ID ||
  notification.id === TOUR_CONTINUE_NOTIFICATION_ID;

const NotificationCenter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, isGuest } = useAuth();
  const [open, setOpen] = useState(false);
  const tourQueryKey = ["tour_progress", user?.id, isGuest] as const;
  const supportedTourKeys = useMemo(() => new Set(["today", "training", "nutrition"]), []);

  const contextualTourTab = useMemo(() => {
    const tab = getTourTabByPath(location.pathname);
    if (!tab || !supportedTourKeys.has(tab.key)) return null;
    return tab;
  }, [location.pathname, supportedTourKeys]);

  const fallbackTourTab = getFirstTourTab();
  const activeTourTab = (contextualTourTab ?? fallbackTourTab) as TourTabDefinition | null;
  const activeTourLabel = activeTourTab?.title ?? "Centro operativo";

  const notificationsQuery = useQuery({
    queryKey: ["user_notifications"],
    queryFn: () => listMyNotifications(25),
    enabled: Boolean(user?.id) && !isGuest,
  });

  const tourStateQuery = useQuery({
    queryKey: tourQueryKey,
    queryFn: () => getTourProgressState(user?.id ?? null, { isGuest }),
    enabled: Boolean(user?.id) && !isGuest,
  });

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) => markMyNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_notifications"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => markAllMyNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_notifications"] });
    },
  });

  const notifications = notificationsQuery.data ?? [];
  const localTourNotification: LocalTourNotification | null = (() => {
    if (!user?.id || isGuest) return null;
    const tourState = tourStateQuery.data ?? getTourProgressLocalSnapshot(user.id, { isGuest: false });
    const nextTab = getNextIncompleteTourTab(tourState) ?? getFirstTourTab();
    const preferredTab = contextualTourTab ?? nextTab;
    const buildReadAt = (notificationId: LocalTourNotification["id"]) =>
      isTourNotificationRead(tourState, notificationId) ? tourState.updatedAt ?? new Date().toISOString() : null;

    if (isTourCompleted(tourState)) {
      return {
        id: TOUR_REPLAY_NOTIFICATION_ID,
        notification_kind: "general",
        title: "Recorrido completado",
        body: `Puedes rehacer el recorrido de ${activeTourLabel} cuando quieras desde este centro de mensajes.`,
        action_path: null,
        action_label: "Rehacer recorrido",
        severity: "info",
        metadata: { source: "local_tour" },
        sender_user_id: null,
        sender_email: null,
        read_at: buildReadAt(TOUR_REPLAY_NOTIFICATION_ID),
        created_at: new Date().toISOString(),
      };
    }

    if (shouldPromptTourInvite(tourState)) {
      if (!preferredTab) return null;
      return {
        id: TOUR_INVITE_NOTIFICATION_ID,
        notification_kind: "general",
        title: "¿Quieres hacer un recorrido guiado?",
        body: `Se iniciará el recorrido: ${preferredTab.title}.`,
        action_path: `${preferredTab.route}?tour=1`,
        action_label: "Iniciar tour",
        severity: "info",
        metadata: { source: "local_tour" },
        sender_user_id: null,
        sender_email: null,
        read_at: buildReadAt(TOUR_INVITE_NOTIFICATION_ID),
        created_at: new Date().toISOString(),
      };
    }

    if (tourState.inviteResponded && tourState.completedTabs.length > 0) {
      if (!preferredTab) return null;
      return {
        id: TOUR_CONTINUE_NOTIFICATION_ID,
        notification_kind: "general",
        title: "Recorrido en progreso",
        body: `Puedes continuar en ${preferredTab.title} cuando quieras.`,
        action_path: `${preferredTab.route}?tour=1`,
        action_label: "Continuar recorrido",
        severity: "info",
        metadata: { source: "local_tour" },
        sender_user_id: null,
        sender_email: null,
        read_at: buildReadAt(TOUR_CONTINUE_NOTIFICATION_ID),
        created_at: new Date().toISOString(),
      };
    }

    if (!preferredTab) return null;
    return {
      id: TOUR_INVITE_NOTIFICATION_ID,
      notification_kind: "general",
      title: "Recorrido disponible",
      body: `Puedes iniciar o retomar el recorrido de ${preferredTab.title} desde aquí.`,
      action_path: `${preferredTab.route}?tour=1`,
      action_label: "Iniciar recorrido",
      severity: "info",
      metadata: { source: "local_tour" },
      sender_user_id: null,
      sender_email: null,
      read_at: buildReadAt(TOUR_INVITE_NOTIFICATION_ID),
      created_at: new Date().toISOString(),
    };
  })();

  const composedNotifications: UserNotification[] = notifications.filter((item) => item.metadata?.source !== "local_tour");
  const unreadCount = composedNotifications.filter((item) => !item.read_at).length;
  const hasLocalUnread = Boolean(localTourNotification && !localTourNotification.read_at);

  const handleNotificationAction = async (notification: UserNotification | LocalTourNotification) => {
    if (isLocalTourNotification(notification)) {
      if (!user?.id) return;

      if (notification.id === TOUR_INVITE_NOTIFICATION_ID) {
        await markTourInviteResponded(user.id, { isGuest: false });
        await queryClient.invalidateQueries({ queryKey: tourQueryKey });
        if (notification.action_path) {
          setOpen(false);
          navigate(notification.action_path);
        }
        return;
      }

      if (notification.id === TOUR_REPLAY_NOTIFICATION_ID) {
        if (!activeTourTab) return;
        await restartTourProgress(user.id, { isGuest: false });
        await queryClient.invalidateQueries({ queryKey: tourQueryKey });
        setOpen(false);
        navigate(`${activeTourTab.route}?tour=1`);
        return;
      }

      if (notification.id === TOUR_CONTINUE_NOTIFICATION_ID && notification.action_path) {
        setOpen(false);
        navigate(notification.action_path);
      }
      return;
    }

    if (!notification.read_at) {
      await markReadMutation.mutateAsync(notification.id);
    }

    if (notification.action_path) {
      setOpen(false);
      navigate(notification.action_path);
    }
  };

  const handleMarkRead = async (notification: UserNotification | LocalTourNotification) => {
    if (!user?.id) return;
    if (isLocalTourNotification(notification)) {
      if (notification.id === TOUR_INVITE_NOTIFICATION_ID || notification.id === TOUR_CONTINUE_NOTIFICATION_ID) {
        await markTourInviteResponded(user.id, { isGuest: false });
      }
      await markTourNotificationRead(user.id, notification.id, { isGuest: false });
      await queryClient.invalidateQueries({ queryKey: tourQueryKey });
      return;
    }
    await markReadMutation.mutateAsync(notification.id);
  };

  const handleMarkAll = async () => {
    if (!user?.id) return;
    if ((notifications ?? []).some((item) => !item.read_at)) {
      await markAllMutation.mutateAsync();
    }
  };

  const handleQuickRestartTour = async () => {
    if (!user?.id || !activeTourTab) return;
    await restartTourProgress(user.id, { isGuest: false });
    await queryClient.invalidateQueries({ queryKey: tourQueryKey });
    setOpen(false);
    navigate(`${activeTourTab.route}?tour=1`);
  };

  if (isGuest || !user?.id) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
          aria-label="Centro de notificaciones"
          title="Centro de notificaciones"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(100vw,28rem)] p-0 sm:max-w-md">
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b border-border/60 px-6 py-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <SheetTitle>Notificaciones</SheetTitle>
                <SheetDescription>Recordatorios internos, avisos operativos y futuras comunicaciones dentro de la app.</SheetDescription>
              </div>
              {unreadCount > 0 ? <Badge variant="default">{unreadCount > 99 ? "99+" : unreadCount}</Badge> : null}
            </div>
          </SheetHeader>

          <div className="flex items-center justify-between border-b border-border/60 px-6 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Centro de mensajes</p>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    Recorrido
                    <ChevronDown className="ml-1.5 h-4 w-4" />
                    {hasLocalUnread ? (
                      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                    ) : null}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>{`Recorrido guiado: ${activeTourLabel}`}</DropdownMenuLabel>
                  {localTourNotification ? (
                    <>
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">{localTourNotification.body}</div>
                      <DropdownMenuItem onClick={() => void handleNotificationAction(localTourNotification)}>
                        {localTourNotification.action_label ?? "Abrir recorrido"}
                      </DropdownMenuItem>
                      {localTourNotification.id !== TOUR_REPLAY_NOTIFICATION_ID ? (
                        <DropdownMenuItem onClick={() => void handleQuickRestartTour()}>
                          Rehacer desde el inicio
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuSeparator />
                      {!localTourNotification.read_at ? (
                        <DropdownMenuItem onClick={() => void handleMarkRead(localTourNotification)}>
                          Marcar como visto
                        </DropdownMenuItem>
                      ) : null}
                    </>
                  ) : (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">Sin recorrido pendiente.</div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                disabled={unreadCount === 0 || markAllMutation.isPending}
                onClick={() => void handleMarkAll()}
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Marcar todas
              </Button>
            </div>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-3 p-6">
              {notificationsQuery.isLoading ? (
                <div className="space-y-3">
                  <div className="h-24 rounded-2xl border border-border/60 bg-muted/20" />
                  <div className="h-24 rounded-2xl border border-border/60 bg-muted/20" />
                </div>
              ) : composedNotifications.length > 0 ? (
                composedNotifications.map((notification) => {
                  const severity = severityMeta[notification.severity];
                  const SeverityIcon = severity.icon;

                  return (
                    <div
                      key={notification.id}
                      className={`rounded-2xl border p-4 ${notification.read_at ? "border-border/60 bg-muted/10" : "border-primary/30 bg-primary/5"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <SeverityIcon className="h-4 w-4 text-primary" />
                            <p className="text-sm font-semibold">{notification.title}</p>
                            {!notification.read_at ? <Badge variant="default">Nueva</Badge> : null}
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.body}</p>
                        </div>
                        <Badge variant="outline">{severity.label}</Badge>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{notification.created_at ? format(new Date(notification.created_at), "yyyy-MM-dd HH:mm") : "--"}</span>
                        <span>{notification.sender_email ? `por ${notification.sender_email}` : "sistema interno"}</span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {notification.action_path ? (
                          <Button
                            size="sm"
                            onClick={() => void handleNotificationAction(notification)}
                            disabled={markReadMutation.isPending}
                          >
                            {notification.action_label ?? "Ir ahora"}
                          </Button>
                        ) : null}
                        {!notification.read_at ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void handleMarkRead(notification)}
                            disabled={markReadMutation.isPending || markAllMutation.isPending}
                          >
                            Marcar leída
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
                  Aún no tienes notificaciones. Este centro ya queda listo para recordatorios, avisos operativos y mensajes futuros.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenter;
