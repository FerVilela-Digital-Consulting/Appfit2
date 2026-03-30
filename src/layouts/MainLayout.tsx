import { useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/Header";
import NotificationBanner from "@/components/NotificationBanner";
import { Outlet, useLocation } from "react-router-dom";
import GuestWarningBanner from "@/components/GuestWarningBanner";
import { useAuth } from "@/context/AuthContext";
import MobileBottomNav from "@/components/MobileBottomNav";
import MobileConnectionBanner from "@/components/MobileConnectionBanner";
import TabTourDialog from "@/components/tour/TabTourDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const MainLayout = () => {
  const { isGuest } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const isMobileToday = isMobile && location.pathname.startsWith("/today");
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const { documentElement, body } = document;
    const previousHtmlOverflow = documentElement.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    documentElement.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      documentElement.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, []);

  useEffect(() => {
    if (isMobileToday) return;
    const main = mainRef.current;
    if (!main) return;

    const scrollToTarget = () => {
      if (!location.hash) {
        main.scrollTo({ top: 0, behavior: "auto" });
        return;
      }

      const targetId = decodeURIComponent(location.hash.slice(1));
      const target = document.getElementById(targetId);

      if (!target) {
        main.scrollTo({ top: 0, behavior: "auto" });
        return;
      }

      const mainRect = main.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const nextTop = main.scrollTop + targetRect.top - mainRect.top - 16;

      main.scrollTo({ top: Math.max(0, nextTop), behavior: "auto" });
    };

    requestAnimationFrame(scrollToTarget);
  }, [isMobileToday, location.hash, location.pathname]);

  return (
    <div className="app-shell flex h-[100dvh] overflow-hidden bg-background md:h-screen">
      <div data-tour="sidebar-nav" className="hidden md:block">
        <Sidebar />
      </div>

        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:ml-64">
          <DashboardHeader />
          <MobileConnectionBanner />
          {isGuest && <GuestWarningBanner />}
          {!isGuest && <NotificationBanner />}

          <main
            ref={mainRef}
            className={cn(
              "min-h-0 flex-1 overscroll-contain px-[10px] pt-2 md:px-8 md:pt-3 md:pb-8",
              isMobileToday
                ? "overflow-hidden pb-[calc(4.25rem+env(safe-area-inset-bottom)+0.25rem)]"
                : "overflow-y-auto pb-28",
            )}
          >
          <Outlet />
        </main>
        <div data-tour="mobile-bottom-nav">
          <MobileBottomNav />
        </div>
        <TabTourDialog />
      </div>
    </div>
  );
};

export default MainLayout;
