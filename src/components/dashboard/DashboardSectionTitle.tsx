import { cn } from "@/lib/utils";

type DashboardSectionTitleProps = {
  children: string;
  className?: string;
};

const DashboardSectionTitle = ({ children, className }: DashboardSectionTitleProps) => {
  return <p className={cn("text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground", className)}>{children}</p>;
};

export default DashboardSectionTitle;
