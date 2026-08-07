import { Route, Routes } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout.jsx";
import DriverLayout from "../layouts/DriverLayout.jsx";

import AdminDashboard from "../pages/admin/Dashboard.jsx";
import Drivers from "../pages/admin/Drivers.jsx";
import Guests from "../pages/admin/Guests.jsx";
import RideRequests from "../pages/admin/Requests.jsx";
import Rides from "../pages/admin/Rides.jsx";
import RideDetails from "../pages/admin/RideDetails.jsx";

import Login from "../pages/auth/Login.jsx";
import DriverDashboard from "../pages/driver/Dashboard.jsx";
import NotFound from "../pages/shared/NotFound.jsx";

import { ROLES, ROUTES } from "../utils/constants.js";

import HomeRedirect from "./HomeRedirect.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import PublicRoute from "./PublicRoute.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path={ROUTES.LOGIN} element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route element={<AdminLayout />}>
          <Route
            path={ROUTES.ADMIN_DASHBOARD}
            element={<AdminDashboard />}
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
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.DRIVER]} />}>
        <Route element={<DriverLayout />}>
          <Route
            path={ROUTES.DRIVER_DASHBOARD}
            element={<DriverDashboard />}
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

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;