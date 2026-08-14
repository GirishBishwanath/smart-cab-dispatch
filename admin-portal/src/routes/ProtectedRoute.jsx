import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import FullPageLoader from "../components/ui/FullPageLoader.jsx";
import useAuth from "../hooks/useAuth.js";
import {
  ROUTES,
  roleHomePath,
} from "../utils/constants.js";

const ProtectedRoute = ({
  allowedRoles,
  children,
}) => {
  const {
    isAuthenticated,
    user,
    initializing,
  } = useAuth();

  const location = useLocation();

  /*
   * Wait until the persisted session has been
   * validated by /auth/me.
   */
  if (initializing) {
    return <FullPageLoader />;
  }

  /*
   * No authenticated user.
   */
  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location }}
        replace
      />
    );
  }

  /*
   * User is authenticated but does not have
   * permission for this portal section.
   */
  if (
    allowedRoles?.length &&
    !allowedRoles.includes(user?.role)
  ) {
    return (
      <Navigate
        to={roleHomePath(user?.role)}
        replace
      />
    );
  }

  /*
   * Supports both:
   *
   * <ProtectedRoute>
   *   <Component />
   * </ProtectedRoute>
   *
   * and:
   *
   * <Route element={<ProtectedRoute />}>
   *   ...
   * </Route>
   */
  return children ?? <Outlet />;
};

export default ProtectedRoute;