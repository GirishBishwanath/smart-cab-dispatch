import { useState } from "react";
import Button from "../ui/Button.jsx";

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
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

const sectionClass =
    "rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5";

const DriverForm = ({
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
        vehicleNumber: initialData.vehicleNumber || "",
        model: initialData.model || "",
        seatCapacity: initialData.seatCapacity || 4,
        luggageCapacity: initialData.luggageCapacity || 2,
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
            seatCapacity: Number(form.seatCapacity),
            luggageCapacity: Number(form.luggageCapacity),
        };

        if (editing) delete data.password;

        onSubmit(data);
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            <section className={sectionClass}>
                <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-950">
                        Driver information
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                        Basic account and contact details.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Driver name" required>
                        <input
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            className={inputClass}
                            placeholder="Rahul Sharma"
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
                            placeholder="driver@smartcab.com"
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
                            placeholder="9999999999"
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
                        Vehicle information
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                        Vehicle assigned to this driver.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Vehicle number" required>
                        <input
                            name="vehicleNumber"
                            value={form.vehicleNumber}
                            onChange={handleChange}
                            className={`${inputClass} uppercase`}
                            placeholder="JH10AB1234"
                            required
                        />
                    </Field>

                    <Field label="Vehicle model" required>
                        <input
                            name="model"
                            value={form.model}
                            onChange={handleChange}
                            className={inputClass}
                            placeholder="Toyota Innova"
                            required
                        />
                    </Field>
                </div>
            </section>

            <section className={sectionClass}>
                <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-950">
                        Vehicle capacity
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                        Maximum passenger and luggage capacity.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Seat capacity" required>
                        <input
                            type="number"
                            min="1"
                            name="seatCapacity"
                            value={form.seatCapacity}
                            onChange={handleChange}
                            className={inputClass}
                            required
                        />
                    </Field>

                    <Field label="Luggage capacity" required>
                        <input
                            type="number"
                            min="0"
                            name="luggageCapacity"
                            value={form.luggageCapacity}
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
                    {editing ? "Update Driver" : "Create Driver"}
                </Button>
            </div>
        </form>
    );
};

export default DriverForm;