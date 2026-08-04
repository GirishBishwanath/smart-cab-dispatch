import { Navigate, Outlet } from "react-router-dom";

import FullPageLoader from "../components/ui/FullPageLoader.jsx";
import useAuth from "../hooks/useAuth.js";
import { roleHomePath } from "../utils/constants.js";

/**
 * Inverse of ProtectedRoute — keeps an authenticated user out of the login
 * screen and sends them to their role's landing page instead.
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, initializing } = useAuth();

  if (initializing) {
    return <FullPageLoader message="Restoring your session…" />;
  }

  if (isAuthenticated) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  return children ?? <Outlet />;
};

export default PublicRoute;
