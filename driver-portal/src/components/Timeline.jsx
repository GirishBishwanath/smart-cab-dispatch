import {
    FaCheck,
    FaLocationDot,
    FaFlagCheckered,
    FaCarSide,
    FaUserCheck,
    FaClock,
} from "react-icons/fa6";

const STEPS = [
    {
        key: "ASSIGNED",
        label: "Assigned",
        description: "Ride assigned by dispatch",
        icon: FaCarSide,
    },
    {
        key: "ACCEPTED",
        label: "Accepted",
        description: "Driver acknowledged the assignment",
        icon: FaUserCheck,
    },
    {
        key: "ARRIVED",
        label: "Arrived",
        description: "Driver arrived at the pickup point",
        icon: FaLocationDot,
    },
    {
        key: "PICKED_UP",
        label: "Started",
        description: "Guest picked up and trip started",
        icon: FaCarSide,
    },
    {
        key: "COMPLETED",
        label: "Completed",
        description: "Trip completed successfully",
        icon: FaFlagCheckered,
    },
];

const ORDER = {
    ASSIGNED: 1,
    ACCEPTED: 2,
    ARRIVED: 3,
    PICKED_UP: 4,
    COMPLETED: 5,
};

const getCurrentOrder = (ride) => {
    let current = ORDER[ride?.status] ?? ORDER.ASSIGNED;
    if (ride?.acceptedAt && current < ORDER.ACCEPTED) current = ORDER.ACCEPTED;
    return current;
};

const getStepState = (step, ride) => {
    const current = getCurrentOrder(ride);
    const order = ORDER[step.key];

    return order < current ? "completed" : order === current ? "current" : "upcoming";
};

const getTimestamp = (key, ride) =>
    ({
        ASSIGNED: ride?.assignedAt,
        ACCEPTED: ride?.acceptedAt,
        ARRIVED: ride?.arrivedAt,
        PICKED_UP: ride?.startedAt,
        COMPLETED: ride?.completedAt,
    })[key] ?? null;

const formatTimestamp = (timestamp) =>
    timestamp
        ? new Date(timestamp).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
          })
        : null;

const Timeline = ({ ride }) => (
    <div className="space-y-0">
        {STEPS.map((step, index) => {
            const Icon = step.icon;
            const state = getStepState(step, ride);
            const formattedTime = formatTimestamp(
                getTimestamp(step.key, ride)
            );
            const isLast = index === STEPS.length - 1;

            const lineClass =
                state === "completed"
                    ? "bg-emerald-200"
                    : "bg-slate-200";

            const iconClass =
                state === "completed"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                    : state === "current"
                        ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-200"
                        : "border-slate-200 bg-white text-slate-300";

            const textClass =
                state === "upcoming"
                    ? "text-slate-400"
                    : "text-slate-900";

            return (
                <div key={step.key} className="relative flex gap-4">
                    {!isLast && (
                        <div
                            className={`absolute left-5 top-10 h-[calc(100%-10px)] w-px ${lineClass}`}
                        />
                    )}

                    <div
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${iconClass}`}
                    >
                        {state === "completed" ? (
                            <FaCheck className="size-3.5" />
                        ) : (
                            <Icon className="size-4" />
                        )}
                    </div>

                    <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-8"}`}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className={`text-sm font-bold ${textClass}`}>
                                        {step.label}
                                    </h3>

                                    {state === "current" && (
                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                                            Current
                                        </span>
                                    )}
                                </div>

                                <p
                                    className={`mt-1 text-sm ${
                                        state === "upcoming"
                                            ? "text-slate-400"
                                            : "text-slate-500"
                                    }`}
                                >
                                    {step.description}
                                </p>
                            </div>

                            {formattedTime && (
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                    <FaClock className="size-3" />
                                    <span>{formattedTime}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
);

export default Timeline;