import { useState } from "react";
import Button from "../ui/Button.jsx";

const LOCATIONS = {
    AIRPORT: { name: "Airport", latitude: 23.8103, longitude: 86.4412 },
    RAILWAY_STATION: {
        name: "Railway Station",
        latitude: 23.8205,
        longitude: 86.435,
    },
    HOTEL_RADISSON: {
        name: "Hotel Radisson",
        latitude: 23.812,
        longitude: 86.443,
    },
    HOTEL_TAJ: {
        name: "Hotel Taj",
        latitude: 23.814,
        longitude: 86.4445,
    },
    EVENT_VENUE: {
        name: "Event Venue",
        latitude: 23.8185,
        longitude: 86.4465,
    },
};

const Field = ({ label, required = false, children }) => (
    <label className="block">
        <span className="mb-1.5 block text-xs font-bold text-slate-600">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
        </span>
        {children}
    </label>
);

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

const sectionClass =
    "rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5";

const GuestForm = ({
    initialData = {},
    onSubmit,
    onCancel,
    loading = false,
}) => {
    const editing = Boolean(initialData._id);

    const [form, setForm] = useState({
        fullName: initialData.fullName || "",
        email: initialData.email || "",
        password: "",
        phone: initialData.phone || "",
        accommodation: initialData.accommodation || "Hotel Radisson",
        pickupKey: "AIRPORT",
        dropKey: "HOTEL_RADISSON",
        groupSize: initialData.groupSize || 1,
        luggageCount: initialData.luggageCount || 0,
    });

    const handleChange = ({ target }) =>
        setForm((prev) => ({
            ...prev,
            [target.name]: target.value,
        }));

    const submit = (event) => {
        event.preventDefault();

        const data = {
            ...form,
            groupSize: Number(form.groupSize),
            luggageCount: Number(form.luggageCount),
            pickupLocation: LOCATIONS[form.pickupKey],
            dropLocation: LOCATIONS[form.dropKey],
        };

        if (editing) delete data.password;

        onSubmit(data);
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            <section className={sectionClass}>
                <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-950">
                        Guest information
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                        Basic account and contact details.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Guest name" required>
                        <input
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            className={inputClass}
                            placeholder="Priya Singh"
                            required
                        />
                    </Field>

                    <Field label="Email address" required>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            readOnly={editing}
                            className={inputClass}
                            placeholder="guest@smartcab.com"
                            required
                        />
                    </Field>

                    <Field label="Phone number" required>
                        <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            className={inputClass}
                            placeholder="9998887776"
                            required
                        />
                    </Field>

                    <Field label="Password" required={!editing}>
                        <input
                            type="password"
                            value={editing ? "••••••••" : form.password}
                            onChange={handleChange}
                            name="password"
                            disabled={editing}
                            autoComplete="new-password"
                            className={inputClass}
                            placeholder="Create password"
                            required={!editing}
                        />
                    </Field>
                </div>
            </section>

            <section className={sectionClass}>
                <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-950">
                        Stay information
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                        Guest accommodation and travel requirements.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Accommodation" required>
                        <select
                            name="accommodation"
                            value={form.accommodation}
                            onChange={handleChange}
                            className={inputClass}
                        >
                            <option>Hotel Radisson</option>
                            <option>Hotel Taj</option>
                        </select>
                    </Field>

                    <div className="hidden sm:block" />
                </div>
            </section>

            <section className={sectionClass}>
                <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-950">
                        Journey details
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                        Default pickup and destination locations.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Pickup location" required>
                        <select
                            name="pickupKey"
                            value={form.pickupKey}
                            onChange={handleChange}
                            className={inputClass}
                        >
                            {Object.entries(LOCATIONS).map(([key, location]) => (
                                <option key={key} value={key}>
                                    {location.name}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Destination" required>
                        <select
                            name="dropKey"
                            value={form.dropKey}
                            onChange={handleChange}
                            className={inputClass}
                        >
                            {Object.entries(LOCATIONS).map(([key, location]) => (
                                <option key={key} value={key}>
                                    {location.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>
            </section>

            <section className={sectionClass}>
                <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-950">
                        Group requirements
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                        Number of passengers and luggage items.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Group size" required>
                        <input
                            type="number"
                            min="1"
                            name="groupSize"
                            value={form.groupSize}
                            onChange={handleChange}
                            className={inputClass}
                            required
                        />
                    </Field>

                    <Field label="Luggage count" required>
                        <input
                            type="number"
                            min="0"
                            name="luggageCount"
                            value={form.luggageCount}
                            onChange={handleChange}
                            className={inputClass}
                            required
                        />
                    </Field>
                </div>
            </section>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 sm:w-auto"
                >
                    Cancel
                </button>

                <Button
                    type="submit"
                    loading={loading}
                    className="w-full rounded-xl !bg-slate-950 !text-white hover:!bg-slate-800 sm:w-auto"
                >
                    {editing ? "Update Guest" : "Create Guest"}
                </Button>
            </div>
        </form>
    );
};

export default GuestForm;