import { useState } from "react";
import Button from "../ui/Button.jsx";

const LOCATIONS = {
  AIRPORT: {
    name: "Airport",
    latitude: 23.8103,
    longitude: 86.4412,
  },
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

const GuestForm = ({
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

    accommodation:
      initialData.accommodation || "Hotel Radisson",

    pickupKey: "AIRPORT",

    dropKey: "HOTEL_RADISSON",

    groupSize: initialData.groupSize || 1,

    luggageCount: initialData.luggageCount || 0,
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

      groupSize: Number(form.groupSize),

      luggageCount: Number(form.luggageCount),

      pickupLocation:
        LOCATIONS[form.pickupKey],

      dropLocation:
        LOCATIONS[form.dropKey],
    });
  };

  const labelClass =
    "block mb-2 text-sm font-medium text-slate-700";

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10";

  return (
    <form
      onSubmit={submit}
      className="space-y-5"
    >
      {/* Guest Name + Email */}

      <div className="grid grid-cols-2 gap-4">

        <div>

          <label className={labelClass}>
            Guest Name
          </label>

          <input
            className={inputClass}
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
          />

        </div>

        <div>

          <label className={labelClass}>
            Email Address
          </label>

          <input
            className={inputClass}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            readOnly={Boolean(initialData._id)}
          />

        </div>

      </div>

      {/* Password + Phone */}

      <div className="grid grid-cols-2 gap-4">

        {!initialData._id ? (

          <div>

            <label className={labelClass}>
              Password
            </label>

            <input
              className={inputClass}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />

          </div>

        ) : (

          <div>

            <label className={labelClass}>
              Password
            </label>

            <button
              type="button"
              disabled
              className="w-full rounded-lg border border-slate-300 bg-slate-100 py-2.5 font-medium text-slate-500 cursor-not-allowed"
            >
              Reset Password (Soon)
            </button>

            <p className="mt-1 text-xs text-slate-500">
              Passwords are never displayed.
            </p>

          </div>

        )}

        <div>

          <label className={labelClass}>
            Phone Number
          </label>

          <input
            className={inputClass}
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />

        </div>

      </div>

      {/* Accommodation */}

      <div>

        <label className={labelClass}>
          Accommodation
        </label>

        <select
          className={inputClass}
          name="accommodation"
          value={form.accommodation}
          onChange={handleChange}
        >
          <option>
            Hotel Radisson
          </option>

          <option>
            Hotel Taj
          </option>
        </select>

      </div>

      {/* Pickup + Destination */}

      <div className="grid grid-cols-2 gap-4">

        <div>

          <label className={labelClass}>
            Pickup Location
          </label>

          <select
            className={inputClass}
            name="pickupKey"
            value={form.pickupKey}
            onChange={handleChange}
          >
            {Object.entries(LOCATIONS).map(
              ([key, value]) => (
                <option
                  key={key}
                  value={key}
                >
                  {value.name}
                </option>
              )
            )}
          </select>

        </div>

        <div>

          <label className={labelClass}>
            Destination
          </label>

          <select
            className={inputClass}
            name="dropKey"
            value={form.dropKey}
            onChange={handleChange}
          >
            {Object.entries(LOCATIONS).map(
              ([key, value]) => (
                <option
                  key={key}
                  value={key}
                >
                  {value.name}
                </option>
              )
            )}
          </select>

        </div>

      </div>

      {/* Group + Luggage */}

      <div className="grid grid-cols-2 gap-4">

        <div>

          <label className={labelClass}>
            Group Size
          </label>

          <input
            className={inputClass}
            type="number"
            name="groupSize"
            value={form.groupSize}
            onChange={handleChange}
            min="1"
            required
          />

        </div>

        <div>

          <label className={labelClass}>
            Luggage Count
          </label>

          <input
            className={inputClass}
            type="number"
            name="luggageCount"
            value={form.luggageCount}
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
          {initialData._id ? "Update Guest" : "Create Guest"}
        </Button>

      </div>
    </form>
  );
};

export default GuestForm;