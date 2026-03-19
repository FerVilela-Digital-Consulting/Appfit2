import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { AccountRole } from "@/context/auth/types";

type RequireAccountRoleProps = {
  allowedRoles: AccountRole[];
};

const ROLE_LOADING_GRACE_MS = 12_000;

const RequireAccountRole = ({ allowedRoles }: RequireAccountRoleProps) => {
  const { user, loading, accountRoleLoading, isGuest, accountRole } = useAuth();
  const [roleLoadingTimedOut, setRoleLoadingTimedOut] = useState(false);

  useEffect(() => {
    if (!user || !accountRoleLoading) {
      setRoleLoadingTimedOut(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRoleLoadingTimedOut(true);
      if (import.meta.env.DEV) {
        console.warn("[RequireAccountRole] Role loading timed out; falling back to current role.");
      }
    }, ROLE_LOADING_GRACE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [user, accountRoleLoading]);

  const roleIsResolvedForGuard = !accountRoleLoading || allowedRoles.includes(accountRole) || roleLoadingTimedOut;

  if ((loading && !user) || (user && !roleIsResolvedForGuard)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || isGuest) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowedRoles.includes(accountRole)) {
    return <Navigate to="/today" replace />;
  }

  return <Outlet />;
};

export default RequireAccountRole;
