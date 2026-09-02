import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaCar,
  FaEye,
  FaMagnifyingGlass,
  FaUser,
} from "react-icons/fa6";

import api from "../services/api.js";
import FleetMap from "../components/FleetMap.jsx";

const STATUS = ["ARRIVED", "PICKED_UP", "COMPLETED"];

const STATUS_STYLES = {
  ARRIVED: "bg-amber-50 text-amber-700 ring-amber-200",
  PICKED_UP: "bg-blue-50 text-blue-700 ring-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 ring-red-200",
  ASSIGNED: "bg-orange-50 text-orange-700 ring-orange-200",
};

const formatStatus = (status = "") =>
  status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const StatusBadge = ({ status }) => (
  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${STATUS_STYLES[status] || "bg-slate-100 text-slate-600 ring-slate-200"}`}>
    {formatStatus(status)}
  </span>
);

const getCancelledBy = (ride) => {
  const source =
    typeof ride.cancelledBy === "string"
      ? ride.cancelledBy
      : ride.cancelledBy?.role ?? ride.cancelledByRole ?? ride.cancellationSource;

  if (source === "GUEST") return "Guest Cancelled";
  if (source === "DRIVER") return "Driver Cancelled";
  if (source === "ADMIN") return "Admin Cancelled";
  return "Cancelled";
};

const getCancellationMessage = (ride) => {
  if (ride.status !== "CANCELLED") return "";

  return `${getCancelledBy(ride)} · ${ride.cancelReason || ride.cancellationReason || "No cancellation reason provided."
    }`;
};

const Rides = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchRides = async () => {
    try {
      const response = await api.get("/rides");
      setRides(Array.isArray(response.data) ? response.data : []);
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

  const sortedRides = useMemo(
    () =>
      [...rides].sort(
        (a, b) =>
          new Date(b.createdAt || b.updatedAt || 0) -
          new Date(a.createdAt || a.updatedAt || 0)
      ),
    [rides]
  );

  const filteredRides = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sortedRides.filter((ride) => {
      const matchesFilter =
        filter === "ALL"
          ? true
          : filter === "ACTIVE"
            ? !["COMPLETED", "CANCELLED"].includes(ride.status)
            : ride.status === filter;

      const guest = ride.guests?.map((g) => g.user?.fullName || "").join(" ");
      const guestPhone = ride.guests?.map((g) => g.user?.phone || "").join(" ");
      const driver = ride.driver?.user?.fullName || "";
      const driverPhone = ride.driver?.user?.phone || "";
      const pickup = ride.pickupLocation?.name || "";
      const drop = ride.dropLocation?.name || "";

      const searchable = `${guest} ${guestPhone} ${driver} ${driverPhone} ${pickup} ${drop}`.toLowerCase();

      return matchesFilter && (!query || searchable.includes(query));
    });
  }, [sortedRides, filter, search]);

  if (loading) {
    return <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />;
  }

  const active = rides.filter(
    (ride) => !["COMPLETED", "CANCELLED"].includes(ride.status)
  ).length;

  const completed = rides.filter((ride) => ride.status === "COMPLETED").length;
  const cancelled = rides.filter((ride) => ride.status === "CANCELLED").length;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">
            Ride operations
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Rides
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Monitor active trips and ride outcomes.
          </p>
        </div>

        <div className="mt-1 inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[11px] font-bold text-emerald-700">Live updates</span>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Total rides", rides.length, "border-slate-200 bg-white", "text-slate-500", "text-slate-950"],
          ["Active", active, "border-blue-100 bg-blue-50/70", "text-blue-700", "text-blue-800"],
          ["Completed", completed, "border-emerald-100 bg-emerald-50/70", "text-emerald-700", "text-emerald-800"],
          ["Cancelled", cancelled, "border-red-100 bg-red-50/70", "text-red-700", "text-red-800"],
        ].map(([label, value, box, labelClass, valueClass]) => (
          <div key={label} className={`rounded-2xl border p-4 ${box}`}>
            <p className={`text-xs font-semibold ${labelClass}`}>{label}</p>
            <p className={`mt-1 text-2xl font-bold ${valueClass}`}>{value}</p>
          </div>
        ))}
      </div>

      <FleetMap
        rides={sortedRides.filter((ride) =>
          ["ASSIGNED", "ARRIVED", "PICKED_UP"].includes(
            ride.status
          )
        )}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <FaMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guest, driver, route or phone..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <div className="flex w-full overflow-x-auto rounded-xl bg-slate-100 p-1 lg:w-auto">
            {[
              ["ALL", "All"],
              ["ACTIVE", "Active"],
              ["COMPLETED", "Completed"],
              ["CANCELLED", "Cancelled"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-bold transition ${filter === value
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[1150px]">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {["Guest", "Driver", "Route", "Status", "Details"].map(
                  (title) => (
                    <th
                      key={title}
                      className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400"
                    >
                      {title}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredRides.map((ride) => {
                const guest = ride.guests?.[0]?.user;
                const message = getCancellationMessage(ride);

                return (
                  <tr key={ride._id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-4 align-top">
                      <p className="text-sm font-semibold text-slate-800">
                        {guest?.fullName || "Guest"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {guest?.phone || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <p className="text-sm font-semibold text-slate-800">
                        {ride.driver?.user?.fullName || "—"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {ride.driver?.user?.phone || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-slate-800">
                          {ride.pickupLocation?.name || "—"}
                        </span>
                        <FaArrowRight className="size-3 shrink-0 text-slate-300" />
                        <span className="font-semibold text-slate-800">
                          {ride.dropLocation?.name || "—"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <StatusBadge status={ride.status} />
                      {message && (
                        <p className="mt-2 max-w-64 text-xs leading-5 text-red-500">
                          {message}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 align-top">
                      <button
                        onClick={() => navigate(`/admin/rides/${ride._id}`)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        <FaEye className="size-3" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 bg-slate-50 p-3 md:hidden">
          {filteredRides.map((ride) => {
            const guest = ride.guests?.[0]?.user;
            const message = getCancellationMessage(ride);

            return (
              <article
                key={ride._id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <FaUser className="size-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {guest?.fullName || "Guest"}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {guest?.phone || "—"}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={ride.status} />
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-3.5">
                  <div className="flex items-start gap-2.5">
                    <FaCar className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Driver
                      </p>
                      <p className="mt-0.5 truncate text-sm font-semibold text-slate-700">
                        {ride.driver?.user?.fullName || "—"}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {ride.driver?.user?.phone || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="my-3 border-t border-slate-200" />

                  <div className="flex items-center gap-2 text-sm">
                    <span className="min-w-0 truncate font-semibold text-slate-800">
                      {ride.pickupLocation?.name || "—"}
                    </span>
                    <FaArrowRight className="size-3 shrink-0 text-slate-300" />
                    <span className="min-w-0 truncate font-semibold text-slate-800">
                      {ride.dropLocation?.name || "—"}
                    </span>
                  </div>
                </div>

                {message && (
                  <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3">
                    <p className="text-xs leading-5 text-red-600">{message}</p>
                  </div>
                )}

                <div className="mt-3">
                  <button
                    onClick={() => navigate(`/admin/rides/${ride._id}`)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white transition hover:bg-slate-800"
                  >
                    <FaEye className="size-3" />
                    Details
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {!filteredRides.length && (
          <div className="p-12 text-center text-sm text-slate-400">
            No rides match your search or filter.
          </div>
        )}
      </section>
    </div>
  );
};

export default Rides;