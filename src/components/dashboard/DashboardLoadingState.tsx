import { cn } from "@/lib/utils";

type DashboardLoadingStateProps = {
  message?: string;
  className?: string;
};

const DashboardLoadingState = ({ message = "Cargando...", className }: DashboardLoadingStateProps) => {
  return <p className={cn("text-sm text-muted-foreground", className)}>{message}</p>;
};

export default DashboardLoadingState;
