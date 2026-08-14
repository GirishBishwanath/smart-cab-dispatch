import { Navigate, Outlet } from "react-router-dom";

import FullPageLoader from "../components/ui/FullPageLoader.jsx";
import useAuth from "../hooks/useAuth.js";

import {
    roleHomePath,
} from "../utils/constants.js";

const PublicRoute = ({ children }) => {
    const {
        isAuthenticated,
        user,
        initializing,
    } = useAuth();

    if (initializing) {
        return <FullPageLoader />;
    }

    if (isAuthenticated) {
        return (
            <Navigate
                to={roleHomePath(user?.role)}
                replace
            />
        );
    }

    return children ?? <Outlet />;
};

export default PublicRoute;