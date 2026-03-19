import type { ReactNode } from "react";

import type { DashboardCheckinModuleKey } from "@/services/dashboardCheckinPreferences";

export type DashboardCardColumn = "left" | "right";

export type DashboardCardPlacement = {
  weight: number;
  preferredColumn: DashboardCardColumn;
  mobileOrder: number;
};

export type DashboardStackCard = {
  key: string;
  placement: DashboardCardPlacement;
  node: ReactNode;
};

export type DashboardStackLayout = {
  orderedCards: DashboardStackCard[];
  left: DashboardStackCard[];
  right: DashboardStackCard[];
};

export type DashboardDailyModule = {
  key: DashboardCheckinModuleKey;
  label: string;
  href: string;
  completed: boolean;
};

export type DashboardPrimaryAction = {
  label: string;
  href: string;
};

export type DashboardUpcomingItem = {
  title: string;
  detail: string;
};

export type DashboardWeeklyConsistencyDay = {
  dateKey: string;
  label: string;
  completed: boolean;
  isToday: boolean;
};

export type DashboardWeeklyConsistency = {
  days: DashboardWeeklyConsistencyDay[];
  completedCount: number;
};

export type DashboardViewModel = {
  dailyModules: DashboardDailyModule[];
  completionCount: number;
  missingModules: DashboardDailyModule[];
  nextModule: DashboardDailyModule | null;
  remainingModuleCount: number;
  todayCompletionPct: number;
  pendingChecklist: DashboardDailyModule[];
  nextActionLabel: string;
  primaryAction: DashboardPrimaryAction;
  weeklyConsistency: DashboardWeeklyConsistency;
  upcomingItems: DashboardUpcomingItem[];
};
