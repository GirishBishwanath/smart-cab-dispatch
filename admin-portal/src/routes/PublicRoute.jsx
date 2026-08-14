import {
  Navigate,
  Outlet,
} from "react-router-dom";

import FullPageLoader from "../components/ui/FullPageLoader.jsx";
import useAuth from "../hooks/useAuth.js";
import { roleHomePath } from "../utils/constants.js";

const PublicRoute = ({ children }) => {
  const {
    isAuthenticated,
    user,
    initializing,
  } = useAuth();

  /*
   * Wait for the persisted session to be
   * validated before deciding where to go.
   */
  if (initializing) {
    return <FullPageLoader />;
  }

  /*
   * Already logged in.
   * Do not allow the user to remain on /login.
   */
  if (isAuthenticated) {
    return (
      <Navigate
        to={roleHomePath(user?.role)}
        replace
      />
    );
  }

  /*
   * Not authenticated.
   * Render the public page.
   */
  return children ?? <Outlet />;
};

export default PublicRoute;