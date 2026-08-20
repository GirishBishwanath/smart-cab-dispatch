import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaCircleCheck,
    FaRoute,
} from "react-icons/fa6";

import RideForm from "../components/RideForm.jsx";
import bookingService from "../services/booking.service.js";
import { ROUTES } from "../utils/constants.js";

const BookRide = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const submit = async (data) => {
        try {
            setLoading(true);
            setError("");

            await bookingService.createRideRequest(data);
            setSuccess(true);
        } catch (err) {
            setError(
                err?.message ?? "Unable to create ride request."
            );
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="space-y-6">
                <header>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
                        Booking submitted
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                        Ride request received
                    </h1>

                    <p className="mt-1.5 text-sm text-slate-500">
                        Dispatch will review your request and arrange a suitable ride.
                    </p>
                </header>

                <section className="mx-auto max-w-2xl rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <FaCircleCheck className="size-7" />
                    </div>

                    <h2 className="mt-5 text-2xl font-bold text-slate-950">
                        Your request is on its way
                    </h2>

                    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                        Once dispatch approves the request and assigns a driver,
                        your active ride will appear in the Current Ride section.
                    </p>

                    <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
                        <button
                            type="button"
                            onClick={() => navigate(ROUTES.CURRENT_RIDE)}
                            className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                        >
                            Check current ride
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate(ROUTES.DASHBOARD)}
                            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                            Back to dashboard
                        </button>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
                    New Booking
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    Book a Ride
                </h1>

                <p className="mt-1.5 text-sm text-slate-500">
                    Tell dispatch where you need to go.
                </p>
            </header>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                </div>
            )}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <FaRoute className="size-4" />
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Trip details
                            </p>

                            <h2 className="mt-1 text-base font-bold text-slate-950">
                                Where are you travelling?
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <RideForm
                        loading={loading}
                        onSubmit={submit}
                    />
                </div>
            </section>
        </div>
    );
};

export default BookRide;