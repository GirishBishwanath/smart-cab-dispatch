import { Navigate } from "react-router-dom";

import useAuth from "../hooks/useAuth.js";
import { roleHomePath } from "../utils/constants.js";

/**
 * Resolves "/" to the landing page of whichever role is signed in.
 * Always rendered behind ProtectedRoute, so `user` is guaranteed here.
 */
const HomeRedirect = () => {
  const { user } = useAuth();

  return <Navigate to={roleHomePath(user.role)} replace />;
};

export default HomeRedirect;
