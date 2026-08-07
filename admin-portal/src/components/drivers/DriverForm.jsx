import { useState } from "react";
import Button from "../ui/Button.jsx";

const DriverForm = ({
    initialData = {},
    onSubmit,
    onCancel,
    loading = false,
}) => {
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

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const submit = (e) => {
        e.preventDefault();

        onSubmit({
            ...form,
            seatCapacity: Number(form.seatCapacity),
            luggageCapacity: Number(form.luggageCapacity),
        });
    };

    return (
        <form
            onSubmit={submit}
            className="space-y-6"
        >
            {/* Row 1 */}

            <div className="grid grid-cols-2 gap-4">

                <div>

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Driver Name
                    </label>

                    <input
                        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address
                    </label>

                    <input
                        className={`w-full border rounded-lg p-3 outline-none ${initialData._id
                            ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                            : "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        readOnly={Boolean(initialData._id)}
                        required
                    />
                </div>

            </div>

            {/* Row 2 */}

            <div className="grid grid-cols-2 gap-4">

                {!initialData._id ? (

                    <div>

                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Password
                        </label>

                        <input
                            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />

                    </div>

                ) : (

                    <div>

                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Password
                        </label>

                        <button
                            type="button"
                            disabled
                            className="w-full rounded-lg border border-slate-300 bg-slate-100 py-3 font-medium text-slate-500 cursor-not-allowed"
                        >
                            Reset Password (Soon)
                        </button>

                        <p className="mt-1 text-xs text-slate-500">
                            Passwords are never displayed.
                        </p>

                    </div>

                )}

                <div>

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Phone Number
                    </label>

                    <input
                        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                    />

                </div>

            </div>

            {/* Vehicle */}

            <div className="grid grid-cols-2 gap-4">

                <div>

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Vehicle Number
                    </label>

                    <input
                        className="w-full border rounded-lg p-3 uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        name="vehicleNumber"
                        value={form.vehicleNumber}
                        onChange={handleChange}
                        required
                    />

                </div>

                <div>

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Vehicle Model
                    </label>

                    <input
                        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        name="model"
                        value={form.model}
                        onChange={handleChange}
                        required
                    />

                </div>

            </div>

            {/* Capacity */}

            <div className="grid grid-cols-2 gap-4">

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Seat Capacity
                    </label>

                    <input
                        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        type="number"
                        name="seatCapacity"
                        value={form.seatCapacity}
                        onChange={handleChange}
                        min="1"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Luggage Capacity
                    </label>

                    <input
                        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        type="number"
                        name="luggageCapacity"
                        value={form.luggageCapacity}
                        onChange={handleChange}
                        min="0"
                        required
                    />
                </div>

            </div>

            {/* Buttons */}

            <div className="grid grid-cols-2 gap-3 border-t pt-5 mt-6">

                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-slate-300 py-3 font-medium hover:bg-slate-100"
                >
                    Cancel
                </button>

                <Button
                    type="submit"
                    loading={loading}
                    className="w-full"
                >
                    {initialData._id ? "Update Driver" : "Create Driver"}
                </Button>

            </div>

        </form>
    );
};

export default DriverForm;