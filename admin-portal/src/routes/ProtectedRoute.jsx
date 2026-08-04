import { Navigate, Outlet, useLocation } from "react-router-dom";

import FullPageLoader from "../components/ui/FullPageLoader.jsx";
import useAuth from "../hooks/useAuth.js";
import { ROUTES, roleHomePath } from "../utils/constants.js";

/**
 * Gate for authenticated areas.
 *
 * `allowedRoles` is optional — omit it to require only a valid session, or pass
 * roles to additionally scope the branch (admin vs driver).
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, user, initializing } = useAuth();
  const location = useLocation();

  // Wait for the boot-time /auth/me check, otherwise a refresh on a protected
  // URL would redirect to login before the session is known.
  if (initializing) {
    return <FullPageLoader message="Restoring your session…" />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
    );
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  return children ?? <Outlet />;
};

export default ProtectedRoute;
