import { useState } from "react";
import {
    FaLocationDot,
    FaUsers,
    FaSuitcaseRolling,
    FaRoute,
} from "react-icons/fa6";

import { TRIP_TYPES } from "../utils/constants.js";

const INITIAL = {
    pickupLocation: {
        name: "",
        latitude: 0,
        longitude: 0,
    },
    dropLocation: {
        name: "",
        latitude: 0,
        longitude: 0,
    },
    groupSize: 1,
    luggageCount: 0,
    tripType: "ON_DEMAND",
};

const field =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100";

const RideForm = ({ loading, onSubmit }) => {
    const [form, setForm] = useState(INITIAL);

    const updateLocation = (type, value) => {
        setForm((previous) => ({
            ...previous,
            [type]: {
                ...previous[type],
                name: value,
            },
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
                <label>
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <FaLocationDot className="size-3 text-emerald-500" />
                        Pickup location
                    </span>

                    <input
                        required
                        value={form.pickupLocation.name}
                        onChange={(e) =>
                            updateLocation(
                                "pickupLocation",
                                e.target.value
                            )
                        }
                        placeholder="Airport, hotel or pickup point"
                        className={field}
                    />
                </label>

                <label>
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <FaLocationDot className="size-3 text-rose-500" />
                        Destination
                    </span>

                    <input
                        required
                        value={form.dropLocation.name}
                        onChange={(e) =>
                            updateLocation(
                                "dropLocation",
                                e.target.value
                            )
                        }
                        placeholder="Hotel, venue or destination"
                        className={field}
                    />
                </label>
            </div>

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
                        onChange={(e) =>
                            setForm((previous) => ({
                                ...previous,
                                groupSize: Number(e.target.value),
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
                        onChange={(e) =>
                            setForm((previous) => ({
                                ...previous,
                                luggageCount: Number(e.target.value),
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
                        onChange={(e) =>
                            setForm((previous) => ({
                                ...previous,
                                tripType: e.target.value,
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