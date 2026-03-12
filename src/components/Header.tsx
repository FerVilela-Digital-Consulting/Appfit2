import { useMemo } from "react";
import {
  BarChart3,
  Bell,
  CalendarDays,
  Dumbbell,
  Home,
  LogOut,
  Menu,
  Plus,
  Ruler,
  Settings,
  Target,
  UtensilsCrossed,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { usePreferences } from "@/context/PreferencesContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TranslationKey } from "@/i18n/translations";

const resolvePageTitle = (pathname: string, t: (key: TranslationKey) => string) => {
  if (pathname.startsWith("/today")) return t("nav.today");
  if (pathname.startsWith("/progress")) return t("nav.progress");
  if (pathname.startsWith("/training")) return t("nav.training");
  if (pathname.startsWith("/body")) return t("nav.body");
  if (pathname.startsWith("/fitness-profile")) return t("nav.fitnessProfile");
  if (pathname.startsWith("/dashboard")) return t("nav.dashboard");
  if (pathname.startsWith("/goals")) return t("nav.goals");
  if (pathname.startsWith("/weight")) return t("nav.weight");
  if (pathname.startsWith("/water")) return t("nav.water");
  if (pathname.startsWith("/sleep")) return t("nav.sleep");
  if (pathname.startsWith("/nutrition")) return t("nav.nutrition");
  if (pathname.startsWith("/biofeedback")) return t("nav.biofeedback");
  if (pathname.startsWith("/measurements")) return t("nav.measurements");
  if (pathname.startsWith("/statistics")) return t("nav.statistics");
  if (pathname.startsWith("/weekly-review")) return t("nav.weeklyReview");
  if (pathname.startsWith("/calendar")) return t("nav.calendar");
  if (pathname.startsWith("/profile")) return t("nav.profile");
  if (pathname.startsWith("/settings")) return t("nav.settings");
  return t("nav.today");
};

const DashboardHeader = () => {
  const { language, t } = usePreferences();
  const { signOut, isGuest, exitGuest } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  const dateStr = today.toLocaleDateString(language === "es" ? "es-ES" : "en-US", options);
  const pageTitle = useMemo(() => resolvePageTitle(location.pathname, t), [location.pathname, t]);

  const days = language === "es" ? ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const currentDay = today.getDay();
  const activeDayIndex = currentDay === 0 ? 6 : currentDay - 1;
  const mobileNavItems = [
    { label: t("nav.today"), path: "/today", icon: Home },
    { label: t("nav.training"), path: "/training", icon: Dumbbell },
    { label: t("nav.nutrition"), path: "/nutrition", icon: UtensilsCrossed },
    { label: t("nav.body"), path: "/body", icon: Ruler },
    { label: t("nav.progress"), path: "/progress", icon: BarChart3 },
    { label: t("nav.calendar"), path: "/calendar", icon: CalendarDays },
    { label: t("nav.fitnessProfile"), path: "/fitness-profile", icon: Target },
    { label: t("nav.settings"), path: "/settings", icon: Settings },
  ];

  const handleAuthAction = async () => {
    try {
      if (isGuest) {
        exitGuest();
        navigate("/auth", { replace: true, state: { fromGuestSwitch: true } });
        return;
      }

      await signOut();
      navigate("/auth", { replace: true });
    } catch (error: any) {
      toast.error(error?.message || "No se pudo cerrar sesion.");
    }
  };

  return (
    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-border bg-card px-3 py-3 md:h-16 md:px-8 md:py-0">
      <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(20rem,calc(100vw-1rem))] p-4">
            <SheetTitle>Navegacion</SheetTitle>
            <div className="mt-4 grid gap-2">
              {mobileNavItems.map((item) => (
                <SheetClose asChild key={item.path}>
                  <Button
                    variant="ghost"
                    className="min-h-11 justify-start rounded-xl"
                    onClick={() => {
                      navigate(item.path);
                    }}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </SheetClose>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-card-foreground md:text-lg">{pageTitle || t("header.dashboard")}</h2>
          <p className="hidden text-xs text-muted-foreground sm:block">{dateStr}</p>
        </div>
        <div className="ml-4 hidden items-center gap-1 md:flex">
          {days.map((day, i) => (
            <span
              key={day}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                i === activeDayIndex
                  ? "bg-primary text-primary-foreground"
                  : i < activeDayIndex
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-muted-foreground"
              }`}
            >
              {day.charAt(0)}
            </span>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 md:gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
              aria-label="Registro rapido"
              title="Registro rapido"
            >
              <Plus className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Registro rapido</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate("/today#water")}>Agregar agua</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate("/today#sleep")}>Agregar sueno</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate("/today#weight")}>Agregar peso</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate("/today#nutrition")}>Agregar comida</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button className="relative hidden h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground md:flex">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
        </button>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
          onClick={handleAuthAction}
          aria-label={isGuest ? "Ir a iniciar sesion" : "Cerrar sesion"}
          title={isGuest ? "Cambiar cuenta" : "Cerrar sesion"}
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
