import { Navigate, Outlet } from "react-router-dom";

import useAuth from "../hooks/useAuth.js";
import { ROUTES } from "../utils/constants.js";

const PublicRoute = () => {
    const {
        isAuthenticated,
        initializing,
    } = useAuth();

    if (initializing) {
        return (
            <div className="grid min-h-screen place-items-center bg-slate-50">
                <div className="size-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-950" />
            </div>
        );
    }

    return isAuthenticated
        ? <Navigate to={ROUTES.DASHBOARD} replace />
        : <Outlet />;
};

export default PublicRoute;