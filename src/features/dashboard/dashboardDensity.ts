export type DashboardCardDensity = "compact" | "comfortable";

export const DASHBOARD_CARD_DENSITY_KEY = "appfit_dashboard_card_density";

export const isDashboardCardDensity = (value: unknown): value is DashboardCardDensity =>
  value === "compact" || value === "comfortable";

export const loadDashboardCardDensity = (): DashboardCardDensity => {
  if (typeof window === "undefined") return "comfortable";
  const stored = window.localStorage.getItem(DASHBOARD_CARD_DENSITY_KEY);
  return isDashboardCardDensity(stored) ? stored : "comfortable";
};

export const saveDashboardCardDensity = (density: DashboardCardDensity) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DASHBOARD_CARD_DENSITY_KEY, density);
};
