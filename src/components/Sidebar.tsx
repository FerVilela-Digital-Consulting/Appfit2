import { BarChart3, CalendarDays, Dumbbell, Home, Settings, ShieldCheck, Target, UtensilsCrossed, Ruler } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { usePreferences } from "@/context/PreferencesContext";
import { findGoalOption } from "@/lib/metabolismOptions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import EditProfileModal from "@/components/profile/EditProfileModal";

const Sidebar = () => {
  const { profile, user, isGuest, canAccessAdmin } = useAuth();
  const { t } = usePreferences();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = true || !prefersReducedMotion;

  const menuItems = [
    { title: t("nav.today"), icon: Home, path: "/today" },
    { title: t("nav.training"), icon: Dumbbell, path: "/training" },
    { title: t("nav.nutrition"), icon: UtensilsCrossed, path: "/nutrition" },
    { title: t("nav.body"), icon: Ruler, path: "/body" },
    { title: t("nav.progress"), icon: BarChart3, path: "/progress" },
    { title: t("nav.calendar"), icon: CalendarDays, path: "/calendar" },
    { title: t("nav.fitnessProfile"), icon: Target, path: "/fitness-profile" },
    { title: t("nav.settings"), icon: Settings, path: "/settings" },
  ];

  if (canAccessAdmin) {
    menuItems.push({ title: "Admin", icon: ShieldCheck, path: "/admin" });
  }

  const displayName = isGuest ? t("sidebar.guest") : profile?.full_name?.trim() || user?.email || t("sidebar.user");
  const heightLabel = profile?.height ? `${profile.height} cm` : "--";
  const weightLabel = profile?.weight ? `${profile.weight} kg` : "--";
  const goalLabel = profile?.goal_type || findGoalOption(profile?.nutrition_goal_type).label || "--";

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-30">
      <div className="flex flex-col items-center pt-8 pb-6 px-6 border-b border-border">
        <button
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          className="relative mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
          aria-label="Editar perfil"
        >
          <Avatar className="w-20 h-20 ring-3 ring-primary/20">
            <AvatarImage src={profile?.avatar_url || undefined} alt="Avatar de usuario" className="object-cover" />
            <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </button>
        <h3 className="text-base font-semibold text-card-foreground">{displayName}</h3>
        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
          <span>{heightLabel}</span>
          <span className="text-border">|</span>
          <span>{weightLabel}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{goalLabel}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 w-full"
          onClick={() => setIsEditModalOpen(true)}
        >
          {t("sidebar.editProfile")}
        </Button>
      </div>

      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <section className="space-y-2 pb-4">
          <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Workspace</p>
          <LayoutGroup id="sidebar-navigation">
            <ul className="space-y-1">
              {menuItems.map((item, index) => (
              <motion.li
                key={item.title}
                initial={shouldAnimate ? { opacity: 0, x: -10 } : false}
                animate={shouldAnimate ? { opacity: 1, x: 0 } : undefined}
                transition={shouldAnimate ? { duration: 0.24, delay: index * 0.03 } : undefined}
              >
                <NavLink
                  to={item.path}
                  className="group relative flex w-full items-center gap-3 overflow-hidden rounded-lg px-4 py-3 text-sm font-medium"
                >
                  {({ isActive }) => (
                    <>
                      {!isActive ? (
                        <span className="absolute inset-0 rounded-lg transition-colors duration-200 group-hover:bg-secondary/80" />
                      ) : null}

                      {isActive ? (
                        <motion.span
                          layoutId="sidebar-active-pill"
                          className="absolute inset-0 rounded-lg bg-accent shadow-[0_8px_24px_-16px_hsl(var(--primary)/0.7)]"
                          transition={
                            shouldAnimate
                              ? { type: "spring", stiffness: 240, damping: 24, mass: 0.7 }
                              : { duration: 0 }
                          }
                        />
                      ) : null}

                      {isActive ? (
                        <motion.span
                          layoutId="sidebar-active-glow"
                          className="absolute inset-0 rounded-lg bg-primary/15"
                          transition={
                            shouldAnimate
                              ? { type: "spring", stiffness: 210, damping: 22, mass: 0.75 }
                              : { duration: 0 }
                          }
                        />
                      ) : null}

                      {isActive ? (
                        <motion.span
                          layoutId="sidebar-active-rail"
                          className="absolute left-0 top-1/2 h-7 w-1.5 -translate-y-1/2 rounded-r-full bg-primary"
                          transition={
                            shouldAnimate
                              ? { type: "spring", stiffness: 260, damping: 24, mass: 0.7 }
                              : { duration: 0 }
                          }
                        />
                      ) : null}

                      <motion.span
                        className={`relative z-10 flex h-5 w-5 items-center justify-center ${
                          isActive ? "text-accent-foreground" : "text-muted-foreground group-hover:text-secondary-foreground"
                        }`}
                        initial={false}
                        animate={shouldAnimate ? { scale: isActive ? 1.06 : 1, x: isActive ? 1 : 0 } : undefined}
                        whileHover={shouldAnimate ? { x: 1, scale: 1.07 } : undefined}
                        whileTap={shouldAnimate ? { scale: 0.96 } : undefined}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      >
                        <item.icon className="h-5 w-5" />
                      </motion.span>

                      <motion.span
                        className={`relative z-10 ${
                          isActive ? "text-accent-foreground" : "text-muted-foreground group-hover:text-secondary-foreground"
                        }`}
                        initial={false}
                        animate={shouldAnimate ? { x: isActive ? 3 : 0, opacity: isActive ? 1 : 0.92 } : undefined}
                        transition={{ type: "spring", stiffness: 280, damping: 24 }}
                      >
                        {item.title}
                      </motion.span>
                    </>
                  )}
                </NavLink>
              </motion.li>
              ))}
            </ul>
          </LayoutGroup>
        </section>
      </nav>

      <EditProfileModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} />
    </aside>
  );
};

export default Sidebar;
