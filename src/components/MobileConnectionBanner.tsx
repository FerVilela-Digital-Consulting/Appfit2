import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";

const MobileConnectionBanner = () => {
  const isMobile = useIsMobile();
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isMobile || isOnline) {
    return null;
  }

  return (
    <div className="border-b border-amber-300/20 bg-amber-500/10 px-4 py-2 text-[12px] text-amber-200 md:hidden">
      <div className="mx-auto flex max-w-5xl items-center gap-2">
        <WifiOff className="h-3.5 w-3.5 shrink-0" />
        <p>Sin conexion. La app sigue disponible con cache local y se sincroniza al reconectar.</p>
      </div>
    </div>
  );
};

export default MobileConnectionBanner;
