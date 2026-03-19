import type { DashboardStackCard, DashboardStackLayout } from "@/features/dashboard/dashboardTypes";

export const buildDashboardLayout = (cards: DashboardStackCard[]): DashboardStackLayout => {
  const orderedCards = [...cards].sort((a, b) => a.placement.mobileOrder - b.placement.mobileOrder);
  const left: DashboardStackCard[] = [];
  const right: DashboardStackCard[] = [];
  let leftWeight = 0;
  let rightWeight = 0;

  orderedCards.forEach((card) => {
    const { preferredColumn, weight } = card.placement;
    const preferredWeight = preferredColumn === "left" ? leftWeight : rightWeight;
    const alternateWeight = preferredColumn === "left" ? rightWeight : leftWeight;
    const shouldUsePreferredColumn = preferredWeight <= alternateWeight + 2;

    if (preferredColumn === "left" && (shouldUsePreferredColumn || leftWeight <= rightWeight)) {
      left.push(card);
      leftWeight += weight;
      return;
    }

    if (preferredColumn === "right" && (shouldUsePreferredColumn || rightWeight <= leftWeight)) {
      right.push(card);
      rightWeight += weight;
      return;
    }

    if (leftWeight <= rightWeight) {
      left.push(card);
      leftWeight += weight;
      return;
    }

    right.push(card);
    rightWeight += weight;
  });

  return { orderedCards, left, right };
};
