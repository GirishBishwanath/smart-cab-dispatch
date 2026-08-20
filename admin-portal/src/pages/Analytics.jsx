import { useEffect, useState } from "react";
import {
  FaChartColumn,
  FaCar,
  FaClipboardList,
  FaRoute,
  FaUsers,
} from "react-icons/fa6";

import dashboardService from "../services/dashboard.service.js";

const Metric = ({ icon: Icon, title, value, detail, className }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          {value}
        </p>
      </div>
      <div className={`flex size-10 items-center justify-center rounded-xl ${className}`}>
        <Icon className="size-4" />
      </div>
    </div>
    <p className="mt-3 text-xs text-slate-400">{detail}</p>
  </div>
);

const Bar = ({ label, value, total, className }) => {
  const width = total ? Math.max((value / total) * 100, value ? 6 : 0) : 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <span className="text-sm font-bold text-slate-900">{value}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${className}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    drivers: [],
    guests: [],
    rideRequests: [],
    rides: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setData(await dashboardService.getDashboardData());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />;
  }

  const available = data.drivers.filter((d) => d.status === "AVAILABLE").length;
  const assigned = data.drivers.filter((d) => d.status === "ASSIGNED").length;
  const onBreak = data.drivers.filter((d) => d.status === "ON_BREAK").length;
  const offline = data.drivers.filter((d) => d.status === "OFFLINE").length;
  const otherDrivers = Math.max(
    data.drivers.length - available - assigned - onBreak - offline,
    0
  );

  const totalRequests = data.rideRequests.length;
  const pending = data.rideRequests.filter((r) => r.status === "PENDING").length;
  const approved = data.rideRequests.filter((r) => r.status === "APPROVED").length;
  const rejected = data.rideRequests.filter((r) => r.status === "REJECTED").length;
  const guestCancelled = data.rideRequests.filter(
    (r) => r.status === "CANCELLED"
  ).length;
  const driverDeclined = data.rideRequests.filter(
    (r) => r.status === "DRIVER_DECLINED"
  ).length;

  const totalRides = data.rides.length;
  const active = data.rides.filter(
    (r) => !["COMPLETED", "CANCELLED"].includes(r.status)
  ).length;
  const completed = data.rides.filter(
    (r) => r.status === "COMPLETED"
  ).length;
  const cancelled = data.rides.filter(
    (r) => r.status === "CANCELLED"
  ).length;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
            Operations intelligence
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Analytics
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            A live overview based on current fleet and ride data.
          </p>
        </div>

        <div className="mt-1 inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[11px] font-bold text-emerald-700">
            Live updates
          </span>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={FaCar}
          title="Drivers"
          value={data.drivers.length}
          detail={`${available} available right now`}
          className="bg-sky-50 text-sky-600"
        />
        <Metric
          icon={FaUsers}
          title="Guests"
          value={data.guests.length}
          detail="Registered guests"
          className="bg-emerald-50 text-emerald-600"
        />
        <Metric
          icon={FaClipboardList}
          title="Requests"
          value={totalRequests}
          detail={`${pending} awaiting action`}
          className="bg-amber-50 text-amber-600"
        />
        <Metric
          icon={FaRoute}
          title="Rides"
          value={totalRides}
          detail={`${active} currently active`}
          className="bg-violet-50 text-violet-600"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <FaCar className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Driver availability
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Current fleet distribution
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-5">
            <Bar label="Available" value={available} total={data.drivers.length} className="bg-emerald-500" />
            <Bar label="Assigned" value={assigned} total={data.drivers.length} className="bg-orange-500" />
            <Bar label="On break" value={onBreak} total={data.drivers.length} className="bg-amber-500" />
            <Bar label="Offline" value={offline} total={data.drivers.length} className="bg-slate-500" />
            <Bar label="Other" value={otherDrivers} total={data.drivers.length} className="bg-violet-500" />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <FaClipboardList className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Request pipeline
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Complete request outcomes
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-5">
            <Bar label="Pending" value={pending} total={totalRequests} className="bg-amber-500" />
            <Bar label="Approved" value={approved} total={totalRequests} className="bg-emerald-500" />
            <Bar label="Rejected by admin" value={rejected} total={totalRequests} className="bg-red-500" />
            <Bar label="Cancelled by guest" value={guestCancelled} total={totalRequests} className="bg-slate-500" />
            <Bar label="Declined by driver" value={driverDeclined} total={totalRequests} className="bg-violet-500" />
          </div>
        </section>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <FaChartColumn className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-950">
              Ride activity
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Current ride lifecycle
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <p className="text-xs font-semibold text-blue-700">Active</p>
            <p className="mt-2 text-2xl font-bold text-blue-800">{active}</p>
            <p className="mt-1 text-xs text-blue-600/70">
              Currently in progress
            </p>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
            <p className="text-xs font-semibold text-emerald-700">Completed</p>
            <p className="mt-2 text-2xl font-bold text-emerald-800">
              {completed}
            </p>
            <p className="mt-1 text-xs text-emerald-600/70">
              Successfully completed
            </p>
          </div>

          <div className="rounded-xl border border-red-100 bg-red-50/60 p-4">
            <p className="text-xs font-semibold text-red-700">Cancelled</p>
            <p className="mt-2 text-2xl font-bold text-red-800">
              {cancelled}
            </p>
            <p className="mt-1 text-xs text-red-600/70">
              Trips not completed
            </p>
          </div>
        </div>

        <div className="mt-7">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Lifecycle distribution</span>
            <span>{totalRides} total rides</span>
          </div>

          <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-slate-100">
            {active > 0 && (
              <div
                className="bg-blue-500 transition-all"
                style={{ width: `${(active / Math.max(totalRides, 1)) * 100}%` }}
              />
            )}
            {completed > 0 && (
              <div
                className="bg-emerald-500 transition-all"
                style={{ width: `${(completed / Math.max(totalRides, 1)) * 100}%` }}
              />
            )}
            {cancelled > 0 && (
              <div
                className="bg-red-500 transition-all"
                style={{ width: `${(cancelled / Math.max(totalRides, 1)) * 100}%` }}
              />
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-blue-500" />
              Active
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500" />
              Completed
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-red-500" />
              Cancelled
            </span>
          </div>
        </div>
      </section>

      <footer className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-xs text-slate-500">
          Analytics uses live operational data.
        </p>
        <p className="text-xs font-semibold text-emerald-600">
          Auto-refresh enabled
        </p>
      </footer>
    </div>
  );
};

export default Analytics;