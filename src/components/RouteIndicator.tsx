import { useLocation } from "react-router-dom";

const RouteIndicator = () => {
  const location = useLocation();

  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-foreground text-background text-xs font-mono px-3 py-1.5 rounded-full opacity-70 z-50 shadow-lg">
      {location.pathname}
    </div>
  );
};

export default RouteIndicator;
