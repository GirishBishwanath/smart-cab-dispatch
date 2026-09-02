import { useCallback, useEffect, useState } from "react";
import {
    FaCircleCheck,
    FaEnvelope,
    FaHotel,
    FaPen,
    FaPhone,
    FaSuitcaseRolling,
    FaUser,
    FaUsers,
    FaXmark,
} from "react-icons/fa6";

import profileService from "../services/profile.service.js";

const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
            <Icon className="size-4" />
        </div>
        <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-1 truncate text-sm font-bold text-slate-900">{value || "Not provided"}</p>
        </div>
    </div>
);

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(false);

    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        accommodation: "",
        groupSize: 1,
        luggageCount: 0,
    });

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await profileService.getMyProfile();
            setProfile(data);

            setForm({
                fullName: data?.user?.fullName ?? "",
                phone: data?.user?.phone ?? "",
                accommodation: data?.guest?.accommodation ?? "",
                groupSize: data?.guest?.groupSize ?? 1,
                luggageCount: data?.guest?.luggageCount ?? 0,
            });
        } catch (err) {
            setError(err?.message ?? "Unable to load your profile.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleChange = ({ target }) => {
        const { name, value } = target;

        setForm((previous) => ({
            ...previous,
            [name]: ["groupSize", "luggageCount"].includes(name)
                ? Number(value)
                : value,
        }));
    };

    const handleSave = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");

            const data = await profileService.updateMyProfile(form);
            setProfile(data);
            setEditing(false);
        } catch (err) {
            setError(err?.message ?? "Unable to update your profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
                <div className="grid gap-5 lg:grid-cols-3">
                    <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
                    <div className="h-64 animate-pulse rounded-2xl bg-slate-200 lg:col-span-2" />
                </div>
            </div>
        );
    }

    const user = profile?.user;
    const guest = profile?.guest;
    const initials = (user?.fullName || "Guest")
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">Guest Account</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">My Profile</h1>
                    <p className="mt-1.5 text-sm text-slate-500">Manage your account and travel information.</p>
                </div>

                <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
                >
                    <FaPen className="size-3" />
                    Edit profile
                </button>
            </header>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                </div>
            )}

            <div className="grid gap-5 lg:grid-cols-3">
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="bg-gradient-to-br from-slate-950 to-slate-800 p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-lg font-bold text-slate-950 shadow-sm">
                                {initials}
                            </div>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                <FaCircleCheck className="size-3" />
                                Active
                            </span>
                        </div>

                        <h2 className="mt-6 text-xl font-bold text-white">{user?.fullName || "Guest"}</h2>
                        <p className="mt-1 text-sm text-slate-400">Guest account</p>
                    </div>

                    <div className="px-6 py-5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accommodation</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                            {guest?.accommodation || "Not provided"}
                        </p>
                    </div>
                </section>

                <section className="lg:col-span-2">
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-slate-950">Account Information</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Information associated with your guest profile.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <InfoItem icon={FaUser} label="Full Name" value={user?.fullName} />
                        <InfoItem icon={FaEnvelope} label="Email" value={user?.email} />
                        <InfoItem icon={FaPhone} label="Phone" value={user?.phone} />
                        <InfoItem icon={FaHotel} label="Accommodation" value={guest?.accommodation} />
                        <InfoItem icon={FaUsers} label="Group Size" value={guest?.groupSize} />
                        <InfoItem icon={FaSuitcaseRolling} label="Luggage" value={guest?.luggageCount} />
                    </div>
                </section>
            </div>

            {editing && (
                <div className="fixed inset-0 z-[70] bg-slate-950/50 p-3 backdrop-blur-sm sm:p-4">
                    <div className="flex min-h-full items-center justify-center">
                        <form
                            onSubmit={handleSave}
                            className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)]"
                        >
                            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
                                <div className="min-w-0">
                                    <h2 className="text-base font-bold text-slate-950 sm:text-lg">Edit profile</h2>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Update your account and travel details.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setEditing(false)}
                                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                    aria-label="Close"
                                >
                                    <FaXmark className="size-4" />
                                </button>
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="sm:col-span-2">
                                        <span className="mb-1.5 block text-xs font-bold text-slate-500">Full name</span>
                                        <input
                                            name="fullName"
                                            value={form.fullName}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                        />
                                    </label>

                                    <label>
                                        <span className="mb-1.5 block text-xs font-bold text-slate-500">Phone</span>
                                        <input
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                        />
                                    </label>

                                    <label>
                                        <span className="mb-1.5 block text-xs font-bold text-slate-500">Accommodation</span>
                                        <input
                                            name="accommodation"
                                            value={form.accommodation}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                        />
                                    </label>

                                    <label>
                                        <span className="mb-1.5 block text-xs font-bold text-slate-500">Group size</span>
                                        <input
                                            type="number"
                                            min="1"
                                            name="groupSize"
                                            value={form.groupSize}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                        />
                                    </label>

                                    <label>
                                        <span className="mb-1.5 block text-xs font-bold text-slate-500">Luggage</span>
                                        <input
                                            type="number"
                                            min="0"
                                            name="luggageCount"
                                            value={form.luggageCount}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
                                <button
                                    type="button"
                                    onClick={() => setEditing(false)}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    {saving ? "Saving…" : "Save changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;