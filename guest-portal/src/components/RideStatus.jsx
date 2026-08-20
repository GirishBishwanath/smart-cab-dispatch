const STYLES = {
    PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
    ASSIGNED: "bg-orange-50 text-orange-700 ring-orange-200",
    ARRIVED: "bg-violet-50 text-violet-700 ring-violet-200",
    PICKED_UP: "bg-blue-50 text-blue-700 ring-blue-200",
    COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    CANCELLED: "bg-red-50 text-red-700 ring-red-200",
    APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    REJECTED: "bg-red-50 text-red-700 ring-red-200",
    DRIVER_DECLINED: "bg-violet-50 text-violet-700 ring-violet-200",
};

const LABELS = {
    DRIVER_DECLINED: "Declined by Driver",
};

const formatStatus = (value = "") =>
    value
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());

const RideStatus = ({ status }) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${STYLES[status] ?? "bg-slate-100 text-slate-600 ring-slate-200"}`}>
        {LABELS[status] ?? formatStatus(status)}
    </span>
);

export default RideStatus;