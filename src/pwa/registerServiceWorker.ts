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

  const updateSW = registerSW({
    immediate: true,
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

