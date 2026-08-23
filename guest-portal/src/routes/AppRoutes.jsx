import { Navigate, Route, Routes } from "react-router-dom";

import GuestLayout from "../layouts/GuestLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import PublicRoute from "./PublicRoute.jsx";

import Login from "../pages/auth/Login.jsx";
import Signup from "../pages/auth/Signup.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import BookRide from "../pages/BookRide.jsx";
import CurrentRide from "../pages/CurrentRide.jsx";
import RideHistory from "../pages/RideHistory.jsx";
import Profile from "../pages/Profile.jsx";
import NotFound from "../pages/NotFound.jsx";

import { ROUTES } from "../utils/constants.js";

const AppRoutes = () => (
    <Routes>
        <Route element={<PublicRoute />}>
            <Route
                path={ROUTES.LOGIN}
                element={<Login />}
            />

            <Route
                path={ROUTES.SIGNUP}
                element={<Signup />}
            />
        </Route>

        <Route element={<ProtectedRoute />}>
            <Route element={<GuestLayout />}>
                <Route
                    path={ROUTES.DASHBOARD}
                    element={<Dashboard />}
                />

                <Route
                    path={ROUTES.BOOK_RIDE}
                    element={<BookRide />}
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

        <Route
            path="/"
            element={
                <Navigate
                    to={ROUTES.DASHBOARD}
                    replace
                />
            }
        />

        <Route
            path="*"
            element={<NotFound />}
        />
    </Routes>
);

export default AppRoutes;