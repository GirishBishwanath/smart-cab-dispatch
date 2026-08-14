import { Navigate } from "react-router-dom";

import useAuth from "../hooks/useAuth.js";
import { roleHomePath } from "../utils/constants.js";

const HomeRedirect = () => {
  const { user } = useAuth();

  return (
    <Navigate
      to={roleHomePath(user?.role)}
      replace
    />
  );
};

export default HomeRedirect;