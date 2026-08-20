import { Navigate, Outlet } from "react-router-dom";

import useAuth from "../hooks/useAuth.js";
import { ROUTES, ROLES } from "../utils/constants.js";

const ProtectedRoute = () => {
    const {
        isAuthenticated,
        initializing,
        user,
    } = useAuth();

    if (initializing) {
        return (
            <div className="grid min-h-screen place-items-center bg-slate-50">
                <div className="size-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-950" />
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== ROLES.GUEST) {
        return (
            <Navigate
                to={ROUTES.LOGIN}
                replace
            />
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;