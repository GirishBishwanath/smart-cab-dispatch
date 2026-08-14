const RideCard = ({ ride }) => {
    const guest = ride?.guests?.[0];

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 p-6">
                <p className="text-sm font-medium text-slate-500">
                    Current Assignment
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                    {ride?.pickupLocation?.name}
                    {" → "}
                    {ride?.dropLocation?.name}
                </h2>
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-2">

                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Guest
                    </p>

                    <p className="mt-2 font-semibold text-slate-900">
                        {guest?.user?.fullName ?? "Guest"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                        {guest?.user?.phone ?? "Phone unavailable"}
                    </p>
                </div>

                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Trip Type
                    </p>

                    <p className="mt-2 font-semibold text-slate-900">
                        {ride?.tripType
                            ?.toLowerCase()
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (char) =>
                                char.toUpperCase()
                            )}
                    </p>
                </div>

                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Pickup
                    </p>

                    <p className="mt-2 font-semibold text-slate-900">
                        {ride?.pickupLocation?.name}
                    </p>
                </div>

                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Destination
                    </p>

                    <p className="mt-2 font-semibold text-slate-900">
                        {ride?.dropLocation?.name}
                    </p>
                </div>

                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Passengers
                    </p>

                    <p className="mt-2 font-semibold text-slate-900">
                        {guest?.groupSize ?? 0}
                    </p>
                </div>

                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Luggage
                    </p>

                    <p className="mt-2 font-semibold text-slate-900">
                        {guest?.luggageCount ?? 0}
                    </p>
                </div>

            </div>

            <div className="border-t border-slate-200 px-6 py-4">

                <div className="grid gap-4 sm:grid-cols-2">

                    <div>
                        <p className="text-xs text-slate-400">
                            Vehicle
                        </p>

                        <p className="mt-1 font-medium text-slate-900">
                            {ride?.vehicle?.vehicleNumber ??
                                "Not available"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-400">
                            Model
                        </p>

                        <p className="mt-1 font-medium text-slate-900">
                            {ride?.vehicle?.model ??
                                "Not available"}
                        </p>
                    </div>

                </div>

            </div>

        </div>
    );
};

export default RideCard;