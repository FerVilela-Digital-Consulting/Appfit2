import { useMemo } from "react";

import { buildDashboardLayout } from "@/features/dashboard/dashboardRegistry";
import type { DashboardStackCard } from "@/features/dashboard/dashboardTypes";
import { cn } from "@/lib/utils";

type DashboardCardStackProps = {
  cards: DashboardStackCard[];
};

const DashboardCardStack = ({ cards }: DashboardCardStackProps) => {
  const columns = useMemo(() => buildDashboardLayout(cards), [cards]);

  if (cards.length === 0) return null;

  return (
    <>
      <div className="space-y-4 xl:hidden">
        {columns.orderedCards.map((card, index) => (
          <div
            key={`mobile-${card.key}`}
            className="min-w-0 transition-all duration-200 motion-reduce:transition-none"
            style={{ transitionDelay: `${Math.min(index * 28, 160)}ms` }}
          >
            {card.node}
          </div>
        ))}
      </div>

      <div
        className={cn(
          "hidden xl:items-start xl:gap-4",
          columns.left.length > 0 && columns.right.length > 0
            ? "xl:grid xl:grid-cols-[minmax(0,1.42fr)_minmax(320px,0.94fr)]"
            : "xl:block",
        )}
      >
        {columns.left.length > 0 ? (
          <div className="space-y-4">
            {columns.left.map((card, index) => (
              <div
                key={`left-${card.key}`}
                className="min-w-0 transition-all duration-200 motion-reduce:transition-none"
                style={{ transitionDelay: `${Math.min(index * 24, 140)}ms` }}
              >
                {card.node}
              </div>
            ))}
          </div>
        ) : null}

        {columns.right.length > 0 ? (
          <div className="space-y-4">
            {columns.right.map((card, index) => (
              <div
                key={`right-${card.key}`}
                className="min-w-0 transition-all duration-200 motion-reduce:transition-none"
                style={{ transitionDelay: `${Math.min(index * 24, 140)}ms` }}
              >
                {card.node}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
};

export default DashboardCardStack;
