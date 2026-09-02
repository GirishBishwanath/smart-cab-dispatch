import { Route, Routes } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout.jsx";

import Dashboard from "../pages/Dashboard.jsx";
import Drivers from "../pages/Drivers.jsx";
import Guests from "../pages/Guests.jsx";
import RideRequests from "../pages/RideRequests.jsx";
import Rides from "../pages/Rides.jsx";
import RideDetails from "../pages/RideDetails.jsx";
import Analytics from "../pages/Analytics.jsx";

import Login from "../pages/auth/Login.jsx";
import NotFound from "../pages/NotFound.jsx";

import { ROLES, ROUTES } from "../utils/constants.js";

import HomeRedirect from "./HomeRedirect.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import PublicRoute from "./PublicRoute.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route
          path={ROUTES.LOGIN}
          element={<Login />}
        />
      </Route>

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[ROLES.ADMIN]}
          />
        }
      >
        <Route element={<AdminLayout />}>

          <Route
            path={ROUTES.ADMIN_DASHBOARD}
            element={<Dashboard />}
          />

          <Route
            path="/admin/drivers"
            element={<Drivers />}
          />

          <Route
            path="/admin/guests"
            element={<Guests />}
          />

          <Route
            path="/admin/ride-requests"
            element={<RideRequests />}
          />

          <Route
            path="/admin/rides"
            element={<Rides />}
          />

          <Route
            path="/admin/rides/:id"
            element={<RideDetails />}
          />

          <Route
            path="/admin/analytics"
            element={<Analytics />}
          />

        </Route>
      </Route>

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomeRedirect />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
};

export default AppRoutes;