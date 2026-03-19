import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import DashboardSectionTitle from "@/components/dashboard/DashboardSectionTitle";

type DashboardCardShellProps = {
  title?: string;
  titleRight?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
};

const DashboardCardShell = ({ title, titleRight, className, contentClassName, children }: DashboardCardShellProps) => {
  return (
    <Card
      className={cn(
        "rounded-2xl border-border/60 transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-sm focus-within:-translate-y-0.5 focus-within:border-border focus-within:shadow-sm motion-reduce:transform-none motion-reduce:transition-none",
        className,
      )}
    >
      <CardContent className={cn("space-y-3 p-4", contentClassName)}>
        {title ? (
          <div className="flex items-center justify-between gap-3">
            <DashboardSectionTitle>{title}</DashboardSectionTitle>
            {titleRight}
          </div>
        ) : null}
        {children}
      </CardContent>
    </Card>
  );
};

export default DashboardCardShell;
