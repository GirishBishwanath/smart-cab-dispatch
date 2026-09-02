import { useState } from "react";
import {
    FaUsers,
    FaSuitcaseRolling,
    FaRoute,
} from "react-icons/fa6";

import { TRIP_TYPES } from "../utils/constants.js";
import LocationPicker from "./LocationPicker.jsx";

const DEFAULT_CENTER = [23.8103, 86.4412];

const INITIAL = {
    pickupLocation: { name: "", latitude: null, longitude: null },
    dropLocation: { name: "", latitude: null, longitude: null },
    groupSize: 1,
    luggageCount: 0,
    tripType: "ON_DEMAND",
};

const field =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100";

const hasCoordinates = (location) =>
    Number.isFinite(location?.latitude) &&
    Number.isFinite(location?.longitude);

const RideForm = ({ loading, onSubmit }) => {
    const [form, setForm] = useState(INITIAL);
    const [locationError, setLocationError] = useState("");

    const updateLocation = (fieldName, location) => {
        setLocationError("");
        setForm((previous) => ({
            ...previous,
            [fieldName]: location,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!hasCoordinates(form.pickupLocation)) {
            setLocationError(
                "Please search for or pin an exact pickup location."
            );
            return;
        }

        if (!hasCoordinates(form.dropLocation)) {
            setLocationError(
                "Please search for or pin an exact destination."
            );
            return;
        }

        if (
            form.pickupLocation.latitude === form.dropLocation.latitude &&
            form.pickupLocation.longitude === form.dropLocation.longitude
        ) {
            setLocationError(
                "Pickup and destination cannot be the same location."
            );
            return;
        }

        onSubmit({
            ...form,
            groupSize: Math.max(1, Number(form.groupSize)),
            luggageCount: Math.max(0, Number(form.luggageCount)),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
                <LocationPicker
                    label="Pickup location"
                    color="emerald"
                    value={form.pickupLocation}
                    onChange={(value) =>
                        updateLocation("pickupLocation", value)
                    }
                    defaultCenter={DEFAULT_CENTER}
                />

                <LocationPicker
                    label="Destination"
                    color="rose"
                    value={form.dropLocation}
                    onChange={(value) =>
                        updateLocation("dropLocation", value)
                    }
                    defaultCenter={DEFAULT_CENTER}
                />
            </div>

            {locationError && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                    {locationError}
                </div>
            )}

            <div className="grid gap-5 sm:grid-cols-3">
                <label>
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <FaUsers className="size-3 text-sky-600" />
                        Passengers
                    </span>

                    <input
                        type="number"
                        min="1"
                        required
                        value={form.groupSize}
                        onChange={(event) =>
                            setForm((previous) => ({
                                ...previous,
                                groupSize: Number(event.target.value),
                            }))
                        }
                        className={field}
                    />
                </label>

                <label>
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <FaSuitcaseRolling className="size-3 text-violet-600" />
                        Luggage
                    </span>

                    <input
                        type="number"
                        min="0"
                        required
                        value={form.luggageCount}
                        onChange={(event) =>
                            setForm((previous) => ({
                                ...previous,
                                luggageCount: Number(event.target.value),
                            }))
                        }
                        className={field}
                    />
                </label>

                <label>
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <FaRoute className="size-3 text-emerald-600" />
                        Trip type
                    </span>

                    <select
                        value={form.tripType}
                        onChange={(event) =>
                            setForm((previous) => ({
                                ...previous,
                                tripType: event.target.value,
                            }))
                        }
                        className={field}
                    >
                        {TRIP_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {type
                                    .replaceAll("_", " ")
                                    .toLowerCase()
                                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading ? "Submitting request…" : "Request Ride"}
            </button>
        </form>
    );
};

export default RideForm;