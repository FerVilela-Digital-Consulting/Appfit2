import { useEffect } from "react";

import { toast } from "@/components/ui/sonner";

const PwaLifecycleNotifier = () => {
  useEffect(() => {
    const handleUpdateAvailable = () => {
      toast("Nueva version disponible", {
        description: "Actualiza para usar la version mas reciente.",
        action: {
          label: "Actualizar",
          onClick: () => {
            void window.__appfitUpdateSW?.(true);
          },
        },
      });
    };

    const handleOfflineReady = () => {
      toast("App lista para uso offline", {
        description: "Ya puedes abrir la app aunque la red sea inestable.",
      });
    };

    window.addEventListener("appfit:pwa-update-available", handleUpdateAvailable);
    window.addEventListener("appfit:pwa-offline-ready", handleOfflineReady);

    return () => {
      window.removeEventListener("appfit:pwa-update-available", handleUpdateAvailable);
      window.removeEventListener("appfit:pwa-offline-ready", handleOfflineReady);
    };
  }, []);

  return null;
};

export default PwaLifecycleNotifier;

