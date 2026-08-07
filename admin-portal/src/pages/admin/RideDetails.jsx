import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import rideService from "../../services/ride.service.js";

const RideDetails = () => {
    const navigate = useNavigate();

    const { id } = useParams();

    const [ride, setRide] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchRide = async () => {

            try {
                const response = await rideService.getRide(id);
                setRide(response);

            } finally {
                setLoading(false);
            }

        };

        fetchRide();

    }, [id]);

    if (loading) {
        return (
            <div className="p-8">
                Loading...
            </div>
        );
    }

    return (

        <div className="space-y-6">

            <div className="flex items-center justify-between">

                <button
                    onClick={() => navigate(-1)}
                    className="text-slate-600 hover:text-slate-900 font-medium"
                >
                    ← Back
                </button>

                <span
                    className={`px-5 py-2 rounded-full text-sm font-semibold ${ride.status === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : ride.status === "PICKED_UP"
                            ? "bg-blue-100 text-blue-700"
                            : ride.status === "ARRIVED"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-slate-100 text-slate-700"
                        }`}
                >
                    {ride.status
                        .replaceAll("_", " ")
                        .toLowerCase()
                        .replace(/\b\w/g, c => c.toUpperCase())}
                </span>

            </div>

            <h1 className="text-4xl font-bold">
                Ride Details
            </h1>

            <div className="grid lg:grid-cols-2 gap-6">

                <div className="bg-white rounded-xl border shadow p-6">

                    <h2 className="text-xl font-semibold mb-5">
                        Ride Information
                    </h2>

                    <div className="space-y-4">

                        <Info
                            title="Trip Type"
                            value={ride.tripType}
                        />

                        <Info
                            title="Status"
                            value={ride.status}
                        />

                        <Info
                            title="Distance"
                            value={`${ride.estimatedDistance} km`}
                        />

                        <Info
                            title="Duration"
                            value={`${ride.estimatedDuration} min`}
                        />

                    </div>

                </div>

                <div className="bg-white rounded-xl border shadow p-6">

                    <h2 className="text-xl font-semibold mb-5">
                        Driver Information
                    </h2>

                    <div className="space-y-4">

                        <Info
                            title="Driver"
                            value={ride.driver?.user?.fullName}
                        />

                        <Info
                            title="Driver Status"
                            value={ride.driver?.status}
                        />

                        <Info
                            title="Phone"
                            value={ride.driver?.user?.phone}
                        />

                    </div>

                </div>

                <div className="bg-white rounded-xl border shadow p-6">

                    <h2 className="text-xl font-semibold mb-5">
                        Guest Information
                    </h2>

                    <div className="space-y-4">

                        <Info
                            title="Guest"
                            value={ride.guests?.[0]?.user?.fullName}
                        />

                        <Info
                            title="Guests"
                            value={`${ride.guests?.length || 0}`}
                        />

                    </div>

                </div>

                <div className="bg-white rounded-xl border shadow p-6">

                    <h2 className="text-xl font-semibold mb-5">
                        Route Information
                    </h2>

                    <div className="space-y-4">

                        <Info
                            title="Pickup"
                            value={ride.pickupLocation?.name}
                        />

                        <Info
                            title="Destination"
                            value={ride.dropLocation?.name}
                        />

                        <Info
                            title="Assigned"
                            value={
                                ride.assignedAt
                                    ? new Date(
                                        ride.assignedAt
                                    ).toLocaleString()
                                    : "-"
                            }
                        />

                        <Info
                            title="Started"
                            value={
                                ride.startedAt
                                    ? new Date(
                                        ride.startedAt
                                    ).toLocaleString()
                                    : "-"
                            }
                        />

                        <Info
                            title="Completed"
                            value={
                                ride.completedAt
                                    ? new Date(
                                        ride.completedAt
                                    ).toLocaleString()
                                    : "-"
                            }
                        />



                    </div>

                </div>

                <div className="bg-white rounded-xl border shadow p-6">

                    <h2 className="text-xl font-semibold mb-8">
                        Ride Timeline
                    </h2>

                    <div className="space-y-6">

                        <TimelineItem
                            completed={true}
                            title="Ride Created"
                            date={ride.createdAt}
                        />

                        <TimelineItem
                            completed={!!ride.assignedAt}
                            title="Driver Assigned"
                            date={ride.assignedAt}
                        />

                        <TimelineItem
                            completed={!!ride.startedAt}
                            title="Guest Picked Up"
                            date={ride.startedAt}
                        />

                        <TimelineItem
                            completed={!!ride.completedAt}
                            title="Ride Completed"
                            date={ride.completedAt}
                        />

                    </div>

                </div>

            </div>

        </div>

    );

};

const Info = ({ title, value }) => (

    <div>
        <p className="text-sm text-slate-500">
            {title}
        </p>

        <p className="text-lg font-semibold mt-1">
            {value || "-"}
        </p>
    </div>

);

const TimelineItem = ({ completed, title, date }) => (

    <div className="flex items-start gap-4">
        <div className="flex flex-col items-center">
            <div
                className={`w-5 h-5 rounded-full ${completed
                    ? "bg-green-500"
                    : "bg-slate-300"
                    }`}
            />

            {title !== "Ride Completed" && (
                <div className="w-px h-10 bg-slate-300" />
            )}
        </div>

        <div>
            <p
                className={`font-semibold ${completed
                    ? "text-slate-900"
                    : "text-slate-400"
                    }`}
            >
                {title}
            </p>

            <p className="text-sm text-slate-500">
                {date ? new Date(date).toLocaleString() : "Pending"}
            </p>
        </div>
    </div>

);

export default RideDetails;