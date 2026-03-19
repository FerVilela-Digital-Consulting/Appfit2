import { Navigate, Outlet } from "react-router-dom";

import { useIsMobile } from "@/hooks/use-mobile";

const RequireDesktopForAdmin = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <Navigate to="/today" replace />;
  }

  return <Outlet />;
};

export default RequireDesktopForAdmin;
