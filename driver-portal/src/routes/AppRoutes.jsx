import { Navigate, Route, Routes } from "react-router-dom";

import DriverLayout from "../layouts/DriverLayout.jsx";
import Login from "../pages/auth/Login.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import CurrentRide from "../pages/CurrentRide.jsx";
import RideHistory from "../pages/RideHistory.jsx";
import Profile from "../pages/Profile.jsx";
import NotFound from "../pages/NotFound.jsx";

import { ROLES, ROUTES } from "../utils/constants.js";
import ProtectedRoute from "./ProtectedRoute.jsx";
import PublicRoute from "./PublicRoute.jsx";

const AppRoutes = () => (
    <Routes>
        <Route element={<PublicRoute />}>
            <Route path={ROUTES.LOGIN} element={<Login />} />
        </Route>

        <Route
            element={
                <ProtectedRoute allowedRoles={[ROLES.DRIVER]} />
            }
        >
            <Route element={<DriverLayout />}>
                <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                <Route path={ROUTES.CURRENT_RIDE} element={<CurrentRide />} />
                <Route path={ROUTES.RIDE_HISTORY} element={<RideHistory />} />
                <Route path={ROUTES.PROFILE} element={<Profile />} />
            </Route>
        </Route>

        <Route
            path="/"
            element={
                <Navigate
                    to={ROUTES.DASHBOARD}
                    replace
                />
            }
        />

        <Route path="*" element={<NotFound />} />
    </Routes>
);

export default AppRoutes;