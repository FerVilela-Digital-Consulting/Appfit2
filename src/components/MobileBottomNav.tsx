import { Dumbbell, Home, UtensilsCrossed } from "lucide-react";
import { NavLink } from "react-router-dom";
import { usePreferences } from "@/context/PreferencesContext";
import { cn } from "@/lib/utils";

const MobileBottomNav = () => {
  const { t } = usePreferences();
  const mobileItems = [
    { label: t("nav.training"), path: "/training", icon: Dumbbell, emphasis: "side" as const },
    { label: t("nav.today"), path: "/today", icon: Home, emphasis: "center" as const },
    { label: t("nav.nutrition"), path: "/nutrition", icon: UtensilsCrossed, emphasis: "side" as const },
  ];

  return (
    <nav
      aria-label="Navegacion principal movil"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 shadow-[0_-12px_30px_-24px_hsl(var(--foreground)/0.45)] backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid h-[4.75rem] grid-cols-3 px-3">
        {mobileItems.map((item) => (
          <li key={item.path} className="flex items-start justify-center">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex h-full w-full flex-col items-center justify-center px-1 text-[10px] transition-colors",
                  item.emphasis === "center"
                    ? "relative -mt-4 gap-1.5"
                    : "gap-1 text-muted-foreground",
                  item.emphasis === "center" && (isActive ? "text-primary" : "text-foreground"),
                  item.emphasis === "side" && (isActive ? "text-primary" : "text-muted-foreground"),
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.emphasis === "center" ? (
                    <>
                      <span
                        className={cn(
                          "flex h-14 w-14 items-center justify-center rounded-full border shadow-[0_14px_30px_-18px_hsl(var(--primary)/0.9)] transition-all",
                          isActive
                            ? "border-primary/60 bg-primary text-primary-foreground"
                            : "border-border/70 bg-background text-foreground",
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                      </span>
                      <span className="line-clamp-1 text-[11px] font-semibold">{item.label}</span>
                    </>
                  ) : (
                    <>
                      <item.icon className="h-4 w-4" />
                      <span className="line-clamp-1">{item.label}</span>
                    </>
                  )}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
