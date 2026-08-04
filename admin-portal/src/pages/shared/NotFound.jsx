import { Link } from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";
import { ROUTES, roleHomePath } from "../../utils/constants.js";

const NotFound = () => {
  const { isAuthenticated, user } = useAuth();

  const homePath = isAuthenticated ? roleHomePath(user.role) : ROUTES.LOGIN;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
      <p className="text-sm font-medium text-slate-400">404</p>

      <h1 className="text-xl font-semibold text-slate-900">Page not found</h1>

      <Link
        to={homePath}
        className="mt-2 text-sm font-medium text-slate-900 underline underline-offset-4 hover:text-slate-600"
      >
        {isAuthenticated ? "Back to dashboard" : "Go to sign in"}
      </Link>
    </div>
  );
};

export default NotFound;
