import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRoute, FaEye, FaUser, FaCar } from "react-icons/fa";

import api from "../services/api.js";


const STATUS = ["ARRIVED", "PICKED_UP", "COMPLETED"];


const STATUS_STYLES = {
  ARRIVED: "bg-amber-50 text-amber-700 ring-amber-200",
  PICKED_UP: "bg-blue-50 text-blue-700 ring-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};


const formatStatus = (status = "") =>
  status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());


const StatusBadge = ({ status }) => (
  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${STATUS_STYLES[status] || "bg-slate-100 text-slate-600 ring-slate-200"}`}>
    {formatStatus(status)}
  </span>
);


const Rides = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRides = async () => {
    try {
      const response = await api.get("/rides");
      setRides(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/rides/${id}/status`, { status });
      await fetchRides();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchRides();
    const interval = setInterval(fetchRides, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />;

  const active = rides.filter((ride) => !["COMPLETED", "CANCELLED"].includes(ride.status)).length;
  const completed = rides.filter((ride) => ride.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">Ride operations</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Rides</h1>
        <p className="mt-1.5 text-sm text-slate-500">Monitor active trips and update ride progress.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total rides</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{rides.length}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
          <p className="text-xs font-semibold text-blue-700">Active</p>
          <p className="mt-1 text-2xl font-bold text-blue-800">{active}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
          <p className="text-xs font-semibold text-emerald-700">Completed</p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">{completed}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[900px]">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {["Guest", "Driver", "Status", "Update", "Details"].map((title) => (
                  <th key={title} className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rides.map((ride) => (
                <tr key={ride._id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    {ride.guests?.map((guest) => (
                      <p key={guest._id} className="text-sm font-semibold text-slate-800">{guest.user?.fullName || "—"}</p>
                    ))}
                    <p className="mt-1 text-xs text-slate-400">{ride.guests?.length || 0} guest{ride.guests?.length > 1 ? "s" : ""}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-800">{ride.driver?.user?.fullName || "—"}</p>
                    <p className="mt-1 text-xs text-slate-400">{ride.driver?.status || "—"}</p>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={ride.status} /></td>
                  <td className="px-5 py-4">
                    <select
                      value={ride.status}
                      onChange={(e) => updateStatus(ride._id, e.target.value)}
                      disabled={ride.status === "COMPLETED"}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-slate-400 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {STATUS.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => navigate(`/admin/rides/${ride._id}`)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                      <FaEye className="size-3" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-100 md:hidden">
          {rides.map((ride) => (
            <div key={ride._id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FaUser className="size-3 text-slate-400" />
                    <p className="truncate text-sm font-bold text-slate-900">{ride.guests?.[0]?.user?.fullName || "Guest"}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <FaCar className="size-3 text-slate-400" />
                    <p className="truncate text-xs text-slate-500">{ride.driver?.user?.fullName || "Driver"}</p>
                  </div>
                </div>
                <StatusBadge status={ride.status} />
              </div>

              <div className="mt-4 flex gap-2">
                <select
                  value={ride.status}
                  onChange={(e) => updateStatus(ride._id, e.target.value)}
                  disabled={ride.status === "COMPLETED"}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 disabled:bg-slate-100"
                >
                  {STATUS.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}
                </select>
                <button onClick={() => navigate(`/admin/rides/${ride._id}`)} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white">
                  <FaEye className="size-3" /> Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {rides.length === 0 && <div className="p-12 text-center text-sm text-slate-400">No rides found.</div>}
      </div>
    </div>
  );
};

export default Rides;