import { Navigate, Outlet, useLocation } from "react-router-dom";

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

    if (initializing) {
        return <FullPageLoader />;
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to={ROUTES.LOGIN}
                state={{ from: location }}
                replace
            />
        );
    }

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

    return children ?? <Outlet />;
};

export default ProtectedRoute;