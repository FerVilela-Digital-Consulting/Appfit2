import { registerSW } from "virtual:pwa-register";

const SW_AUTO_RELOAD_KEY = "appfit.pwa-auto-reload-on-update";

declare global {
  interface Window {
    __appfitUpdateSW?: (reloadPage?: boolean) => Promise<void>;
  }
}

export const registerAppServiceWorker = () => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  const register = () => {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        const alreadyAutoReloaded = sessionStorage.getItem(SW_AUTO_RELOAD_KEY) === "1";

        if (!alreadyAutoReloaded) {
          sessionStorage.setItem(SW_AUTO_RELOAD_KEY, "1");
          void updateSW(true);
          return;
        }

        window.dispatchEvent(new CustomEvent("appfit:pwa-update-available"));
      },
      onOfflineReady() {
        window.dispatchEvent(new CustomEvent("appfit:pwa-offline-ready"));
      },
      onRegisterError(error) {
        console.warn("[PWA] Service Worker registration failed.", error);
      },
    });

    window.__appfitUpdateSW = updateSW;
  };

  register();
};

