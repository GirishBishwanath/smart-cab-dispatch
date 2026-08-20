import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCar,
  FaCheckCircle,
  FaClock,
  FaRoute,
  FaUsers,
} from "react-icons/fa";

import rideService from "../services/ride.service.js";

const STATUS_STYLES = {
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  PICKED_UP: "bg-blue-50 text-blue-700 ring-blue-200",
  ARRIVED: "bg-amber-50 text-amber-700 ring-amber-200",
  ASSIGNED: "bg-orange-50 text-orange-700 ring-orange-200",
  CANCELLED: "bg-red-50 text-red-700 ring-red-200",
};

const STATUS_ORDER = {
  ASSIGNED: 1,
  ARRIVED: 2,
  PICKED_UP: 3,
  COMPLETED: 4,
};

const formatStatus = (status = "") =>
  status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString() : "—";

const StatusBadge = ({ status }) => (
  <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${STATUS_STYLES[status] || "bg-slate-100 text-slate-600 ring-slate-200"}`}>
    {formatStatus(status)}
  </span>
);

const Info = ({ title, value }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
      {title}
    </p>
    <p className="mt-1.5 break-words text-sm font-semibold text-slate-800">
      {value || "—"}
    </p>
  </div>
);

const Panel = ({ icon: Icon, title, children }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
      <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="size-4" />
      </div>
      <h2 className="text-sm font-bold text-slate-950">{title}</h2>
    </div>
    <div className="grid gap-5 p-5 sm:grid-cols-2">
      {children}
    </div>
  </section>
);

const TimelineItem = ({ completed, title, date, last }) => (
  <div className="relative flex gap-4">
    <div className="relative flex w-5 shrink-0 justify-center">
      <div className={`z-10 flex size-5 items-center justify-center rounded-full ${completed ? "bg-emerald-500 text-white" : "bg-slate-200"}`}>
        {completed && <FaCheckCircle className="size-2.5" />}
      </div>

      {!last && (
        <div className="absolute top-5 h-full w-px bg-slate-200" />
      )}
    </div>

    <div className="pb-7">
      <p className={`text-sm font-semibold ${completed ? "text-slate-900" : "text-slate-400"}`}>
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {date ? formatDateTime(date) : "Pending"}
      </p>
    </div>
  </div>
);

const RideDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const response = await rideService.getRide(id);
        setRide(response);
      } finally {
        setLoading(false);
      }
    };

    fetchRide();
  }, [id]);

  if (loading) {
    return <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />;
  }

  if (!ride) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <p className="font-semibold text-slate-800">Ride not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-sm font-bold text-sky-600"
        >
          Go back
        </button>
      </div>
    );
  }

  const currentStep = STATUS_ORDER[ride.status] || 0;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-950"
      >
        <FaArrowLeft className="size-3" />
        Back to rides
      </button>

      <section className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-sky-400">
              Ride details
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              Ride #{ride._id?.slice(-6)}
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              {ride.pickupLocation?.name || "Pickup"} →{" "}
              {ride.dropLocation?.name || "Destination"}
            </p>
          </div>

          <StatusBadge status={ride.status} />
        </div>
      </section>

      {ride.status === "CANCELLED" && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-red-600">
            Ride cancelled
          </p>

          <p className="mt-2 text-sm font-semibold text-red-800">
            Cancelled by {ride.cancelledBy || "Unknown"}
          </p>

          <p className="mt-1 text-sm text-red-700">
            {ride.cancelReason || "No cancellation reason provided."}
          </p>

          <p className="mt-2 text-xs text-red-500">
            {formatDateTime(ride.cancelledAt)}
          </p>
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel icon={FaRoute} title="Ride information">
          <Info title="Trip type" value={formatStatus(ride.tripType)} />
          <Info title="Status" value={formatStatus(ride.status)} />
          <Info title="Distance" value={`${ride.estimatedDistance ?? "—"} km`} />
          <Info title="Duration" value={`${ride.estimatedDuration ?? "—"} min`} />
        </Panel>

        <Panel icon={FaCar} title="Driver information">
          <Info title="Driver" value={ride.driver?.user?.fullName} />
          <Info title="Driver status" value={formatStatus(ride.driver?.status)} />
          <Info title="Phone" value={ride.driver?.user?.phone} />
          <Info title="Vehicle" value={ride.vehicle?.vehicleNumber} />
        </Panel>

        <Panel icon={FaUsers} title="Guest information">
          <Info title="Primary guest" value={ride.guests?.[0]?.user?.fullName} />
          <Info title="Guest count" value={ride.guests?.length || 0} />
          <Info title="Phone" value={ride.guests?.[0]?.user?.phone} />
          <Info title="Accommodation" value={ride.guests?.[0]?.accommodation} />
        </Panel>

        <Panel icon={FaRoute} title="Route information">
          <Info title="Pickup" value={ride.pickupLocation?.name} />
          <Info title="Destination" value={ride.dropLocation?.name} />
          <Info title="Assigned" value={formatDateTime(ride.assignedAt)} />
          <Info title="Started" value={formatDateTime(ride.startedAt)} />
          <Info
            title="Completed"
            value={
              ride.status === "COMPLETED"
                ? formatDateTime(ride.completedAt)
                : "—"
            }
          />
        </Panel>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <FaClock className="size-4" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-950">
              Ride timeline
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Progress from creation to completion
            </p>
          </div>
        </div>

        <div className="mt-7">
          <TimelineItem
            completed
            title="Ride created"
            date={ride.createdAt}
          />

          <TimelineItem
            completed={currentStep >= 1}
            title="Driver assigned"
            date={currentStep >= 1 ? ride.assignedAt : null}
          />

          <TimelineItem
            completed={currentStep >= 3}
            title="Guest picked up"
            date={currentStep >= 3 ? ride.startedAt : null}
          />

          <TimelineItem
            completed={currentStep >= 4}
            title="Ride completed"
            date={currentStep >= 4 ? ride.completedAt : null}
            last
          />
        </div>
      </section>
    </div>
  );
};

export default RideDetails;