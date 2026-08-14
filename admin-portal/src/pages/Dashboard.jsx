import { useEffect, useState } from "react";
import {
  FaCar,
  FaUsers,
  FaClipboardList,
  FaRoute,
  FaCircle,
  FaArrowUp,
} from "react-icons/fa";

import dashboardService from "../services/dashboard.service.js";
import useAuth from "../hooks/useAuth.js";


const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
  ASSIGNED: "bg-orange-50 text-orange-700 ring-orange-200",
  AVAILABLE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  ON_BREAK: "bg-amber-50 text-amber-700 ring-amber-200",
  OFFLINE: "bg-slate-100 text-slate-600 ring-slate-200",
  ARRIVED: "bg-violet-50 text-violet-700 ring-violet-200",
  PICKED_UP: "bg-blue-50 text-blue-700 ring-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 ring-red-200",
};


const formatStatus = (status = "") =>
  status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());


const StatusBadge = ({ status }) => (
  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${STATUS_STYLES[status] || "bg-slate-100 text-slate-600 ring-slate-200"}`}>
    {formatStatus(status)}
  </span>
);


const MetricCard = ({ icon: Icon, title, value, detail, iconClass }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      </div>
      <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
        <Icon className="size-5" />
      </div>
    </div>
    <p className="mt-4 text-xs font-medium text-slate-400">{detail}</p>
  </div>
);


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
  const activeRides = data.rides.filter((r) => !["COMPLETED", "CANCELLED"].includes(r.status)).length;

  const firstName = user?.fullName?.split(" ")[0] || "Admin";

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-slate-950 px-6 py-6 shadow-sm sm:px-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-400">Admin Dashboard</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Here's what's happening across your cab operations.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/5 px-3 py-2">
            <FaCircle className="size-2 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-300">Live operations</span>
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
        />
        <MetricCard
          icon={FaUsers}
          title="Guests"
          value={data.guests.length}
          detail="Registered guests"
          iconClass="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          icon={FaClipboardList}
          title="Ride requests"
          value={data.rideRequests.length}
          detail={`${pendingRequests} awaiting approval`}
          iconClass="bg-amber-50 text-amber-600"
        />
        <MetricCard
          icon={FaRoute}
          title="Rides"
          value={data.rides.length}
          detail={`${activeRides} active · ${completedRides} completed`}
          iconClass="bg-violet-50 text-violet-600"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-950">Recent ride requests</h2>
              <p className="mt-1 text-xs text-slate-400">Latest incoming requests</p>
            </div>
            <FaClipboardList className="size-4 text-slate-300" />
          </div>

          {data.rideRequests.length === 0 ? (
            <EmptyState text="No ride requests yet" />
          ) : (
            <div className="divide-y divide-slate-100">
              {data.rideRequests.slice(0, 5).map((ride) => (
                <div key={ride._id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {ride.guest?.user?.fullName || "Guest"}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {ride.pickupLocation?.name || "Pickup"} → {ride.dropLocation?.name || "Destination"}
                    </p>
                  </div>
                  <StatusBadge status={ride.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-950">Driver status</h2>
              <p className="mt-1 text-xs text-slate-400">Current fleet availability</p>
            </div>
            <FaCar className="size-4 text-slate-300" />
          </div>

          {data.drivers.length === 0 ? (
            <EmptyState text="No drivers registered" />
          ) : (
            <div className="divide-y divide-slate-100">
              {data.drivers.slice(0, 5).map((driver) => (
                <div key={driver._id} className="flex items-center justify-between gap-4 px-5 py-4">
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
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-slate-950">Recent rides</h2>
            <p className="mt-1 text-xs text-slate-400">Latest ride activity</p>
          </div>
          <FaArrowUp className="size-4 rotate-45 text-slate-300" />
        </div>

        {data.rides.length === 0 ? (
          <EmptyState text="No rides available" />
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Driver</th>
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Guest</th>
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.rides.slice(0, 5).map((ride) => (
                    <tr key={ride._id} className="transition hover:bg-slate-50/70">
                      <td className="px-5 py-4 text-sm font-semibold text-slate-800">{ride.driver?.user?.fullName || "—"}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{ride.guests?.[0]?.user?.fullName || "—"}</td>
                      <td className="px-5 py-4"><StatusBadge status={ride.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {data.rides.slice(0, 5).map((ride) => (
                <div key={ride._id} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{ride.driver?.user?.fullName || "—"}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">{ride.guests?.[0]?.user?.fullName || "—"}</p>
                  </div>
                  <StatusBadge status={ride.status} />
                </div>
              ))}
            </div>
          </>
        )}

        <div className="border-t border-slate-100 px-5 py-3">
          <p className="text-xs text-slate-400">Dashboard updates automatically every 5 seconds.</p>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;