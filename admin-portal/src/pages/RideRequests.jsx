import { useEffect, useState } from "react";
import { FaClipboardList, FaCheck, FaXmark, FaLocationDot } from "react-icons/fa6";

import api from "../services/api.js";


const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
};


const StatusBadge = ({ status }) => (
  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${STATUS_STYLES[status] || "bg-slate-100 text-slate-600 ring-slate-200"}`}>
    {status === "PENDING" ? "Pending" : status === "APPROVED" ? "Approved" : "Rejected"}
  </span>
);


const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const response = await api.get("/ride-requests");
      setRequests(response.data);
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
      alert("Ride approved successfully.");
    } catch (err) {
      alert(err.message);
    }
  };

  const declineRide = async (id) => {
    const reason = window.prompt("Reason for declining this request?");
    if (reason === null) return;

    try {
      await api.patch(`/ride-requests/${id}/decline`, { reason });
      await fetchRequests();
      alert("Ride request declined.");
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />;

  const pending = requests.filter((r) => r.status === "PENDING").length;
  const approved = requests.filter((r) => r.status === "APPROVED").length;
  const rejected = requests.filter((r) => r.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-600">Dispatch queue</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Ride Requests</h1>
        <p className="mt-1.5 text-sm text-slate-500">Review and manage incoming ride requests.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
          <p className="text-xs font-semibold text-amber-700">Pending</p>
          <p className="mt-1 text-2xl font-bold text-amber-800">{pending}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
          <p className="text-xs font-semibold text-emerald-700">Approved</p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">{approved}</p>
        </div>
        <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4">
          <p className="text-xs font-semibold text-red-700">Rejected</p>
          <p className="mt-1 text-2xl font-bold text-red-800">{rejected}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[900px]">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {["Guest", "Pickup", "Destination", "Status", "Action"].map((title) => (
                  <th key={title} className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((request) => (
                <tr key={request._id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-900">{request.guest?.user?.fullName || "Guest"}</p>
                    <p className="mt-1 text-xs text-slate-500">{request.guest?.user?.phone || "—"}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{request.pickupLocation?.name || "—"}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{request.dropLocation?.name || "—"}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={request.status} />
                    {request.status === "REJECTED" && request.rejectionReason && (
                      <p className="mt-2 max-w-48 text-xs text-slate-400">{request.rejectionReason}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {request.status === "PENDING" ? (
                      <div className="flex gap-2">
                        <button onClick={() => approveRide(request._id)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">
                          <FaCheck className="size-3" /> Approve
                        </button>
                        <button onClick={() => declineRide(request._id)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">
                          <FaXmark className="size-3" /> Decline
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">No action required</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-100 md:hidden">
          {requests.map((request) => (
            <div key={request._id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <FaClipboardList className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{request.guest?.user?.fullName || "Guest"}</p>
                    <p className="truncate text-xs text-slate-500">{request.guest?.user?.phone || "—"}</p>
                  </div>
                </div>
                <StatusBadge status={request.status} />
              </div>

              <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3">
                <div className="flex items-start gap-2">
                  <FaLocationDot className="mt-0.5 size-3 shrink-0 text-emerald-500" />
                  <p className="text-xs text-slate-600">{request.pickupLocation?.name || "Pickup unavailable"}</p>
                </div>
                <div className="flex items-start gap-2">
                  <FaLocationDot className="mt-0.5 size-3 shrink-0 text-red-500" />
                  <p className="text-xs text-slate-600">{request.dropLocation?.name || "Destination unavailable"}</p>
                </div>
              </div>

              {request.status === "REJECTED" && request.rejectionReason && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{request.rejectionReason}</p>
              )}

              {request.status === "PENDING" && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={() => approveRide(request._id)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-bold text-white">
                    <FaCheck className="size-3" /> Approve
                  </button>
                  <button onClick={() => declineRide(request._id)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 text-xs font-bold text-red-600">
                    <FaXmark className="size-3" /> Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {requests.length === 0 && <div className="p-12 text-center text-sm text-slate-400">No ride requests found.</div>}
      </div>
    </div>
  );
};

export default Requests;