import { useEffect, useMemo, useState } from "react";
import {
  FaCheck,
  FaClipboardList,
  FaLocationDot,
  FaXmark,
} from "react-icons/fa6";

import api from "../services/api.js";

const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
  CANCELLED: "bg-slate-100 text-slate-600 ring-slate-200",
  DRIVER_DECLINED: "bg-violet-50 text-violet-700 ring-violet-200",
};

const STATUS_LABELS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Guest Cancelled",
  DRIVER_DECLINED: "Driver Declined",
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600 ring-slate-200"}`}>
    {STATUS_LABELS[status] ?? status}
  </span>
);

const getMessage = (request) =>
  request.rejectionReason ||
  request.cancellationReason ||
  request.declineReason ||
  request.driverDeclineReason ||
  "";

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const fetchRequests = async () => {
    try {
      const response = await api.get("/ride-requests");
      setRequests(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approveRide = async (id) => {
    try {
      await api.patch(`/ride-requests/${id}/approve`);
      await fetchRequests();
    } catch (err) {
      alert(err.message);
    }
  };

  const declineRide = async (id) => {
    const reason = window.prompt("Reason for declining this request?");

    if (reason === null) return;

    if (!reason.trim()) {
      alert("A reason is required.");
      return;
    }

    try {
      await api.patch(`/ride-requests/${id}/decline`, {
        reason: reason.trim(),
      });
      await fetchRequests();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const sortedRequests = useMemo(
    () =>
      [...requests].sort(
        (a, b) =>
          new Date(b.createdAt || b.updatedAt || 0) -
          new Date(a.createdAt || a.updatedAt || 0)
      ),
    [requests]
  );

  const filteredRequests = useMemo(
    () =>
      filter === "ALL"
        ? sortedRequests
        : sortedRequests.filter((request) => request.status === filter),
    [sortedRequests, filter]
  );

  const counts = {
    pending: requests.filter((r) => r.status === "PENDING").length,
    approved: requests.filter((r) => r.status === "APPROVED").length,
    rejected: requests.filter((r) => r.status === "REJECTED").length,
    cancelled: requests.filter((r) => r.status === "CANCELLED").length,
    driverDeclined: requests.filter((r) => r.status === "DRIVER_DECLINED").length,
  };

  if (loading) {
    return <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />;
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-600">
            Dispatch queue
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Ride Requests
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Review and manage incoming ride requests.
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Pending", counts.pending, "border-amber-100 bg-amber-50/70", "text-amber-700", "text-amber-800"],
          ["Approved", counts.approved, "border-emerald-100 bg-emerald-50/70", "text-emerald-700", "text-emerald-800"],
          ["Rejected", counts.rejected, "border-red-100 bg-red-50/70", "text-red-700", "text-red-800"],
          ["Guest Cancelled", counts.cancelled, "border-slate-200 bg-slate-100", "text-slate-600", "text-slate-800"],
          ["Driver Declined", counts.driverDeclined, "border-violet-100 bg-violet-50/70", "text-violet-700", "text-violet-800"],
        ].map(([label, count, box, labelClass, valueClass]) => (
          <div key={label} className={`rounded-2xl border p-4 ${box}`}>
            <p className={`text-xs font-semibold ${labelClass}`}>{label}</p>
            <p className={`mt-1 text-2xl font-bold ${valueClass}`}>{count}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-700">Filter requests</p>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="min-w-[175px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          >
            <option value="ALL">All requests</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Guest Cancelled</option>
            <option value="DRIVER_DECLINED">Driver Declined</option>
          </select>
        </div>
      </section>

      {/* Desktop */}
      <section className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {["Guest", "Pickup", "Destination", "Status", "Action"].map(
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
              {filteredRequests.map((request) => {
                const message = getMessage(request);

                return (
                  <tr key={request._id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-4 align-top">
                      <p className="text-sm font-semibold text-slate-900">
                        {request.guest?.user?.fullName || "Guest"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {request.guest?.user?.phone || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {request.pickupLocation?.name || "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {request.dropLocation?.name || "—"}
                    </td>

                    <td className="px-5 py-4 align-top">
                      <StatusBadge status={request.status} />
                      {message && (
                        <p className="mt-2 max-w-64 text-xs leading-5 text-slate-500">
                          {message}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {request.status === "PENDING" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveRide(request._id)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                          >
                            <FaCheck className="size-3" />
                            Approve
                          </button>

                          <button
                            onClick={() => declineRide(request._id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                          >
                            <FaXmark className="size-3" />
                            Decline
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">
                          No action required
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mobile — independent cards */}
      <section className="space-y-3 md:hidden">
        {filteredRequests.map((request) => {
          const message = getMessage(request);

          return (
            <article
              key={request._id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <FaClipboardList className="size-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {request.guest?.user?.fullName || "Guest"}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {request.guest?.user?.phone || "—"}
                    </p>
                  </div>
                </div>

                <StatusBadge status={request.status} />
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-3.5">
                <div className="flex items-start gap-2.5">
                  <FaLocationDot className="mt-0.5 size-3 shrink-0 text-emerald-500" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Pickup
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-slate-700">
                      {request.pickupLocation?.name || "Unavailable"}
                    </p>
                  </div>
                </div>

                <div className="my-2.5 ml-1.5 h-3 border-l border-dashed border-slate-300" />

                <div className="flex items-start gap-2.5">
                  <FaLocationDot className="mt-0.5 size-3 shrink-0 text-red-500" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Destination
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-slate-700">
                      {request.dropLocation?.name || "Unavailable"}
                    </p>
                  </div>
                </div>
              </div>

              {message && (
                <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3">
                  <p className="text-xs leading-5 text-slate-600">{message}</p>
                </div>
              )}

              {request.status === "PENDING" && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => approveRide(request._id)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    <FaCheck className="size-3" />
                    Approve
                  </button>

                  <button
                    onClick={() => declineRide(request._id)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    <FaXmark className="size-3" />
                    Decline
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </section>

      {!filteredRequests.length && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-400">
          No requests match your filter.
        </div>
      )}
    </div>
  );
};

export default Requests;