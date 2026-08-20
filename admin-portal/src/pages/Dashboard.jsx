import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaCar,
  FaUsers,
  FaClipboardList,
  FaRoute,
  FaCircle,
} from "react-icons/fa";

import dashboardService from "../services/dashboard.service.js";
import useAuth from "../hooks/useAuth.js";

const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
  CANCELLED: "bg-slate-100 text-slate-600 ring-slate-200",
  DRIVER_DECLINED: "bg-violet-50 text-violet-700 ring-violet-200",
  ASSIGNED: "bg-orange-50 text-orange-700 ring-orange-200",
  AVAILABLE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  ON_BREAK: "bg-amber-50 text-amber-700 ring-amber-200",
  OFFLINE: "bg-slate-100 text-slate-600 ring-slate-200",
  ARRIVED: "bg-violet-50 text-violet-700 ring-violet-200",
  PICKED_UP: "bg-blue-50 text-blue-700 ring-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const STATUS_LABELS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Guest Cancelled",
  DRIVER_DECLINED: "Driver Declined",
};

const formatStatus = (status = "") =>
  status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${
      STATUS_STYLES[status] ||
      "bg-slate-100 text-slate-600 ring-slate-200"
    }`}
  >
    {STATUS_LABELS[status] ?? formatStatus(status)}
  </span>
);

const getTime = (item) =>
  new Date(
    item?.createdAt ??
      item?.updatedAt ??
      item?.completedAt ??
      item?.cancelledAt ??
      0
  ).getTime();

const recent = (items = []) =>
  [...items].sort((a, b) => getTime(b) - getTime(a)).slice(0, 5);

const MetricCard = ({ icon: Icon, title, value, detail, iconClass, to }) => {
  const navigate = useNavigate();

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-5 pb-14 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="size-5" />
        </div>
      </div>

      <p className="mt-4 text-xs font-medium text-slate-400">{detail}</p>

      <button
        type="button"
        onClick={() => navigate(to)}
        aria-label={`Open ${title}`}
        className="absolute bottom-4 right-4 flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
      >
        <FaArrowRight className="size-3" />
      </button>
    </div>
  );
};

const SectionHeader = ({ title, description, icon: Icon }) => (
  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
    <div>
      <h2 className="text-sm font-bold text-slate-950">{title}</h2>
      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
    <Icon className="size-4 text-slate-300" />
  </div>
);

const ViewMore = ({ label, to }) => {
  const navigate = useNavigate();

  return (
    <div className="border-t border-slate-100 px-5 py-3">
      <button
        type="button"
        onClick={() => navigate(to)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 transition hover:text-slate-950"
      >
        {label}
        <FaArrowRight className="size-3" />
      </button>
    </div>
  );
};

const EmptyState = ({ text }) => (
  <div className="px-5 py-10 text-center">
    <p className="text-sm font-medium text-slate-400">{text}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    drivers: [],
    guests: [],
    rideRequests: [],
    rides: [],
  });

  const fetchDashboard = async () => {
    try {
      const response = await dashboardService.getDashboardData();
      setData(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-36 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  const availableDrivers = data.drivers.filter((d) => d.status === "AVAILABLE").length;
  const assignedDrivers = data.drivers.filter((d) => d.status === "ASSIGNED").length;
  const pendingRequests = data.rideRequests.filter((r) => r.status === "PENDING").length;
  const completedRides = data.rides.filter((r) => r.status === "COMPLETED").length;
  const activeRides = data.rides.filter(
    (r) => !["COMPLETED", "CANCELLED"].includes(r.status)
  ).length;

  const firstName = user?.fullName?.split(" ")[0] || "Admin";
  const recentRequests = recent(data.rideRequests);
  const recentDrivers = recent(data.drivers);
  const recentRides = recent(data.rides);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-slate-950 px-6 py-6 shadow-sm sm:px-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-400">
              Admin Dashboard
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Here's what's happening across your cab operations.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/5 px-3 py-2">
            <FaCircle className="size-2 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-300">
              Live operations
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={FaCar}
          title="Drivers"
          value={data.drivers.length}
          detail={`${availableDrivers} available · ${assignedDrivers} assigned`}
          iconClass="bg-sky-50 text-sky-600"
          to="/admin/drivers"
        />

        <MetricCard
          icon={FaUsers}
          title="Guests"
          value={data.guests.length}
          detail="Registered guests"
          iconClass="bg-emerald-50 text-emerald-600"
          to="/admin/guests"
        />

        <MetricCard
          icon={FaClipboardList}
          title="Ride requests"
          value={data.rideRequests.length}
          detail={`${pendingRequests} awaiting approval`}
          iconClass="bg-amber-50 text-amber-600"
          to="/admin/ride-requests"
        />

        <MetricCard
          icon={FaRoute}
          title="Rides"
          value={data.rides.length}
          detail={`${activeRides} active · ${completedRides} completed`}
          iconClass="bg-violet-50 text-violet-600"
          to="/admin/rides"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            title="Recent ride requests"
            description="Latest incoming requests"
            icon={FaClipboardList}
          />

          {recentRequests.length === 0 ? (
            <EmptyState text="No ride requests yet" />
          ) : (
            <div className="divide-y divide-slate-100">
              {recentRequests.map((ride) => (
                <div
                  key={ride._id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {ride.guest?.user?.fullName || "Guest"}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {ride.pickupLocation?.name || "Pickup"} →{" "}
                      {ride.dropLocation?.name || "Destination"}
                    </p>
                  </div>

                  <StatusBadge status={ride.status} />
                </div>
              ))}
            </div>
          )}

          <ViewMore label="View all requests" to="/admin/ride-requests" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            title="Driver status"
            description="Current fleet availability"
            icon={FaCar}
          />

          {recentDrivers.length === 0 ? (
            <EmptyState text="No drivers registered" />
          ) : (
            <div className="divide-y divide-slate-100">
              {recentDrivers.map((driver) => (
                <div
                  key={driver._id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {driver.user?.fullName
                        ?.split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase() || "DR"}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {driver.user?.fullName || "Driver"}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {driver.user?.phone || "No phone number"}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={driver.status} />
                </div>
              ))}
            </div>
          )}

          <ViewMore label="View all drivers" to="/admin/drivers" />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader
          title="Recent rides"
          description="Latest ride activity"
          icon={FaRoute}
        />

        {recentRides.length === 0 ? (
          <EmptyState text="No rides available" />
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    {["Driver", "Guest", "Route", "Status"].map((title) => (
                      <th
                        key={title}
                        className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400"
                      >
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recentRides.map((ride) => (
                    <tr
                      key={ride._id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                        {ride.driver?.user?.fullName || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {ride.guests?.[0]?.user?.fullName || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {ride.pickupLocation?.name || "—"} →{" "}
                        {ride.dropLocation?.name || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={ride.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {recentRides.map((ride) => (
                <div
                  key={ride._id}
                  className="flex items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {ride.driver?.user?.fullName || "—"}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {ride.guests?.[0]?.user?.fullName || "—"}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-400">
                      {ride.pickupLocation?.name || "—"} →{" "}
                      {ride.dropLocation?.name || "—"}
                    </p>
                  </div>

                  <StatusBadge status={ride.status} />
                </div>
              ))}
            </div>
          </>
        )}

        <ViewMore label="View all rides" to="/admin/rides" />
      </section>

      <p className="text-center text-xs text-slate-400">
        Dashboard updates automatically every 5 seconds.
      </p>
    </div>
  );
};

export default Dashboard;