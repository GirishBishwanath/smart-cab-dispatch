import { useCallback, useEffect, useState } from "react";
import {
  FaRoute,
  FaUser,
  FaLocationDot,
  FaCarSide,
} from "react-icons/fa6";
import { Link } from "react-router-dom";

import rideService from "../services/ride.service.js";
import StatusBadge from "../components/StatusBadge.jsx";
import Timeline from "../components/Timeline.jsx";
import { ROUTES } from "../utils/constants.js";
import socketService from "../services/socket.service.js";

const RideTimeline = () => {
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRide = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const currentRide = await rideService.getCurrentRide();
      setRide(currentRide ?? null);
    } catch (err) {
      if (err?.status === 404) {
        setRide(null);
        setError("");
        return;
      }

      console.error("Failed to load ride timeline:", err);
      setError(err?.message ?? "Unable to load the ride timeline.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRide();

    const removeAssigned = socketService.subscribe("ride:assigned", loadRide);
    const removeAccepted = socketService.subscribe("ride:accepted", loadRide);
    const removeStatus = socketService.subscribe("ride:status", loadRide);
    const removeCompleted = socketService.subscribe("ride:completed", loadRide);

    return () => {
      removeAssigned();
      removeAccepted();
      removeStatus();
      removeCompleted();
    };
  }, [loadRide]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-700">{error}</p>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
          <FaRoute className="size-5" />
        </div>

        <h1 className="mt-4 text-xl font-bold text-slate-950">
          No Active Ride
        </h1>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          A ride timeline will appear here when dispatch assigns you a ride.
        </p>

        <Link
          to={ROUTES.DASHBOARD}
          className="mt-6 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const guest = ride.guests?.[0];
  const vehicle = ride.vehicle;

  const tripType =
    ride.tripType
      ?.toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-slate-950 px-6 py-6 shadow-sm sm:px-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-400">
              Driver Operations
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Ride Timeline
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Follow every milestone of your current trip.
            </p>
          </div>

          <StatusBadge status={ride.status} />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
            Current assignment
          </p>

          <div className="mt-5 grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <div>
              <div className="flex items-center gap-2 text-slate-400">
                <FaLocationDot className="size-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Pickup
                </span>
              </div>

              <p className="mt-2 text-xl font-bold text-slate-950">
                {ride.pickupLocation?.name ?? "—"}
              </p>
            </div>

            <div className="hidden items-center justify-center md:flex">
              <div className="h-px w-16 bg-slate-200" />
              <div className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500">
                <FaRoute className="size-3.5" />
              </div>
              <div className="h-px w-16 bg-slate-200" />
            </div>

            <div className="md:text-right">
              <div className="flex items-center gap-2 text-slate-400 md:justify-end">
                <FaLocationDot className="size-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Destination
                </span>
              </div>

              <p className="mt-2 text-xl font-bold text-slate-950">
                {ride.dropLocation?.name ?? "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid divide-y divide-slate-200 bg-slate-50 md:grid-cols-3 md:divide-x md:divide-y-0">
          <div className="p-5">
            <div className="flex items-center gap-2 text-slate-400">
              <FaUser className="size-3.5" />
              <p className="text-[10px] font-bold uppercase tracking-wider">
                Guest
              </p>
            </div>

            <p className="mt-2 text-sm font-bold text-slate-900">
              {guest?.user?.fullName ?? "Guest"}
            </p>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-2 text-slate-400">
              <FaCarSide className="size-3.5" />
              <p className="text-[10px] font-bold uppercase tracking-wider">
                Vehicle
              </p>
            </div>

            <p className="mt-2 text-sm font-bold text-slate-900">
              {vehicle?.vehicleNumber ?? "—"}
            </p>
          </div>

          <div className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Trip Type
            </p>

            <p className="mt-2 text-sm font-bold text-slate-900">
              {tripType}
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600">
            Progress
          </p>

          <h2 className="mt-1 text-lg font-bold text-slate-950">
            Trip Progress
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Each milestone is recorded as the trip progresses.
          </p>
        </div>

        <div className="px-6 py-7 sm:px-8">
          <Timeline ride={ride} />
        </div>
      </section>
    </div>
  );
};

export default RideTimeline;