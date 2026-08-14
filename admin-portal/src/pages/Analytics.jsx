import { useEffect, useState } from "react";
import { FaChartColumn, FaCar, FaClipboardList, FaRoute, FaUsers } from "react-icons/fa6";

import dashboardService from "../services/dashboard.service.js";


const Metric = ({ icon: Icon, title, value, detail, className }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
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
        <div className={`h-full rounded-full ${className}`} style={{ width: `${width}%` }} />
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
        const response = await dashboardService.getDashboardData();
        setData(response);
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

  if (loading) return <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />;

  const available = data.drivers.filter((d) => d.status === "AVAILABLE").length;
  const assigned = data.drivers.filter((d) => d.status === "ASSIGNED").length;
  const otherDrivers = data.drivers.length - available - assigned;

  const pending = data.rideRequests.filter((r) => r.status === "PENDING").length;
  const approved = data.rideRequests.filter((r) => r.status === "APPROVED").length;
  const rejected = data.rideRequests.filter((r) => r.status === "REJECTED").length;

  const active = data.rides.filter((r) => !["COMPLETED", "CANCELLED"].includes(r.status)).length;
  const completed = data.rides.filter((r) => r.status === "COMPLETED").length;
  const cancelled = data.rides.filter((r) => r.status === "CANCELLED").length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">Operations intelligence</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Analytics</h1>
        <p className="mt-1.5 text-sm text-slate-500">A live overview based on current fleet and ride data.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={FaCar} title="Drivers" value={data.drivers.length} detail={`${available} available right now`} className="bg-sky-50 text-sky-600" />
        <Metric icon={FaUsers} title="Guests" value={data.guests.length} detail="Registered guests" className="bg-emerald-50 text-emerald-600" />
        <Metric icon={FaClipboardList} title="Requests" value={data.rideRequests.length} detail={`${pending} awaiting action`} className="bg-amber-50 text-amber-600" />
        <Metric icon={FaRoute} title="Rides" value={data.rides.length} detail={`${active} currently active`} className="bg-violet-50 text-violet-600" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <FaCar className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-950">Driver availability</h2>
              <p className="mt-1 text-xs text-slate-400">Current driver distribution</p>
            </div>
          </div>

          <div className="mt-7 space-y-5">
            <Bar label="Available" value={available} total={data.drivers.length} className="bg-emerald-500" />
            <Bar label="Assigned" value={assigned} total={data.drivers.length} className="bg-orange-500" />
            <Bar label="Other" value={otherDrivers} total={data.drivers.length} className="bg-slate-400" />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <FaClipboardList className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-950">Request pipeline</h2>
              <p className="mt-1 text-xs text-slate-400">Current request outcomes</p>
            </div>
          </div>

          <div className="mt-7 space-y-5">
            <Bar label="Pending" value={pending} total={data.rideRequests.length} className="bg-amber-500" />
            <Bar label="Approved" value={approved} total={data.rideRequests.length} className="bg-emerald-500" />
            <Bar label="Rejected" value={rejected} total={data.rideRequests.length} className="bg-red-500" />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <FaChartColumn className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-950">Ride activity</h2>
              <p className="mt-1 text-xs text-slate-400">Current ride lifecycle distribution</p>
            </div>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-3">
            <Bar label="Active" value={active} total={data.rides.length} className="bg-blue-500" />
            <Bar label="Completed" value={completed} total={data.rides.length} className="bg-emerald-500" />
            <Bar label="Cancelled" value={cancelled} total={data.rides.length} className="bg-red-500" />
          </div>
        </section>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-xs text-slate-500">Analytics uses live operational data.</p>
        <p className="text-xs font-semibold text-emerald-600">Auto-refresh enabled</p>
      </div>
    </div>
  );
};

export default Analytics;