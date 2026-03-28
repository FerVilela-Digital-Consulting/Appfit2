import { registerSW } from "virtual:pwa-register";

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
      immediate: false,
      onNeedRefresh() {
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

  const isPublicBootRoute =
    window.location.pathname === "/" ||
    window.location.pathname.startsWith("/auth");

  if (!isPublicBootRoute) {
    register();
    return;
  }

  const scheduleRegister = () => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => register(), { timeout: 3500 });
      return;
    }
    window.setTimeout(register, 1500);
  };

  if (document.readyState === "complete") {
    scheduleRegister();
  } else {
    window.addEventListener("load", scheduleRegister, { once: true });
  }
};

