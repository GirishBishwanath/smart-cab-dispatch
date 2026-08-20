import { useCallback, useEffect, useState } from "react";
import {
    FaUser,
    FaPhone,
    FaEnvelope,
    FaCarSide,
    FaUsers,
    FaSuitcaseRolling,
    FaCircleCheck,
} from "react-icons/fa6";

import driverService from "../services/driver.service.js";
import StatusBadge from "../components/StatusBadge.jsx";

const formatStatus = (status = "") =>
    status
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
            <Icon className="size-4" />
        </div>

        <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {label}
            </p>

            <p className="mt-1 truncate text-sm font-bold text-slate-900">
                {value || "Not provided"}
            </p>
        </div>
    </div>
);

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await driverService.getMyProfile();
            setProfile(data);
        } catch (err) {
            setError(err?.message ?? "Unable to load your profile.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
                    <div className="h-64 animate-pulse rounded-2xl bg-slate-200 lg:col-span-2" />
                </div>

                <div className="h-44 animate-pulse rounded-2xl bg-slate-200" />
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

    const user = profile?.user;
    const driver = profile?.driver;
    const vehicle = profile?.vehicle;

    const initials = (user?.fullName || "Driver")
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="space-y-6">
            <header>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-600">
                    Driver Account
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    My Profile
                </h1>

                <p className="mt-1.5 text-sm text-slate-500">
                    Your driver account, vehicle and operational information.
                </p>
            </header>

            <div className="grid gap-5 lg:grid-cols-3">
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="bg-gradient-to-br from-slate-950 to-slate-800 p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-xl font-bold text-slate-950 shadow-sm">
                                {initials}
                            </div>

                            {driver?.status && <StatusBadge status={driver.status} />}
                        </div>

                        <h2 className="mt-6 text-xl font-bold text-white">
                            {user?.fullName ?? "Driver"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">Driver</p>
                    </div>

                    <div className="px-6 py-5">
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <FaCircleCheck className="size-4 text-emerald-500" />
                            <span className="font-medium">Active driver account</span>
                        </div>
                    </div>
                </section>

                <section className="lg:col-span-2">
                    <div className="mb-4">
                        <h2 className="mt-1 text-lg font-bold text-slate-950">
                            Account Information
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Information associated with your driver profile.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <InfoItem
                            icon={FaUser}
                            label="Full Name"
                            value={user?.fullName}
                        />

                        <InfoItem
                            icon={FaEnvelope}
                            label="Email"
                            value={user?.email}
                        />

                        <InfoItem
                            icon={FaPhone}
                            label="Phone"
                            value={user?.phone}
                        />

                        <InfoItem
                            icon={FaCircleCheck}
                            label="Driver Status"
                            value={
                                driver?.status
                                    ? formatStatus(driver.status)
                                    : "Unknown"
                            }
                        />
                    </div>
                </section>
            </div>

            <section>
                <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                        Fleet
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-slate-950">
                        Assigned Vehicle
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Vehicle assigned to your driver account.
                    </p>
                </div>

                {vehicle ? (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <FaCarSide className="size-5" />
                                </div>

                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Registration
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-slate-950">
                                        {vehicle.vehicleNumber}
                                    </p>

                                    <p className="text-sm text-slate-500">
                                        {vehicle.model || "Vehicle model not specified"}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <FaUsers className="size-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">
                                            Seats
                                        </span>
                                    </div>

                                    <p className="mt-2 text-lg font-bold text-slate-950">
                                        {vehicle.seatCapacity}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-4">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <FaSuitcaseRolling className="size-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">
                                            Luggage
                                        </span>
                                    </div>

                                    <p className="mt-2 text-lg font-bold text-slate-950">
                                        {vehicle.luggageCapacity}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                        <FaCarSide className="mx-auto size-6 text-slate-300" />

                        <p className="mt-3 text-sm font-semibold text-slate-700">
                            No vehicle assigned
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            Contact dispatch if a vehicle should be assigned to you.
                        </p>
                    </div>
                )}
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
                        Operations
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-slate-950">
                        Operational Information
                    </h2>
                </div>

                <div className="grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    <div className="p-5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Current Ride
                        </p>

                        <p className="mt-1.5 text-sm font-bold text-slate-900">
                            {driver?.currentRide ? "Active" : "None"}
                        </p>
                    </div>

                    <div className="p-5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Vehicle Status
                        </p>

                        <p className="mt-1.5 text-sm font-bold text-slate-900">
                            {vehicle?.isActive ? "Active" : "Inactive"}
                        </p>
                    </div>

                    <div className="p-5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Driver Since
                        </p>

                        <p className="mt-1.5 text-sm font-bold text-slate-900">
                            {driver?.createdAt
                                ? new Date(driver.createdAt).toLocaleDateString(
                                    undefined,
                                    {
                                        month: "short",
                                        year: "numeric",
                                    }
                                )
                                : "—"}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Profile;