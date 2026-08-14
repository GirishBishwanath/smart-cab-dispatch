import { Route, Routes } from "react-router-dom";

import DriverLayout from "../layouts/DriverLayout.jsx";

import Login from "../pages/auth/Login.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import CurrentRide from "../pages/CurrentRide.jsx";
import RideHistory from "../pages/RideHistory.jsx";
import Profile from "../pages/Profile.jsx";
import NotFound from "../pages/NotFound.jsx";

import {
    ROLES,
    ROUTES,
} from "../utils/constants.js";

import ProtectedRoute from "./ProtectedRoute.jsx";
import PublicRoute from "./PublicRoute.jsx";

const AppRoutes = () => {
    return (
        <Routes>

            {/* ================= PUBLIC ================= */}

            <Route element={<PublicRoute />}>
                <Route
                    path={ROUTES.LOGIN}
                    element={<Login />}
                />
            </Route>


            {/* ================= DRIVER ================= */}

            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={[
                            ROLES.DRIVER,
                        ]}
                    />
                }
            >
                <Route element={<DriverLayout />}>

                    <Route
                        path={ROUTES.DASHBOARD}
                        element={<Dashboard />}
                    />

                    <Route
                        path={ROUTES.CURRENT_RIDE}
                        element={<CurrentRide />}
                    />

                    <Route
                        path={ROUTES.RIDE_HISTORY}
                        element={<RideHistory />}
                    />

                    <Route
                        path={ROUTES.PROFILE}
                        element={<Profile />}
                    />

                </Route>
            </Route>


            {/* ================= ROOT ================= */}

            <Route
                path="/"
                element={
                    <ProtectedRoute
                        allowedRoles={[
                            ROLES.DRIVER,
                        ]}
                    >
                        <Dashboard />
                    </ProtectedRoute>
                }
            />


            {/* ================= 404 ================= */}

            <Route
                path="*"
                element={<NotFound />}
            />

        </Routes>
    );
};

export default AppRoutes;