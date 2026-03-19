import { cn } from "@/lib/utils";

type DashboardEmptyStateProps = {
  message: string;
  className?: string;
};

const DashboardEmptyState = ({ message, className }: DashboardEmptyStateProps) => {
  return <p className={cn("text-xs text-muted-foreground", className)}>{message}</p>;
};

export default DashboardEmptyState;
