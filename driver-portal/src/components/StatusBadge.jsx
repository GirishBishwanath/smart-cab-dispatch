const STATUS_STYLES = {
    ASSIGNED:
        "bg-amber-50 text-amber-700 ring-1 ring-amber-200",

    ARRIVED:
        "bg-blue-50 text-blue-700 ring-1 ring-blue-200",

    PICKED_UP:
        "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",

    COMPLETED:
        "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
};

const formatStatus = (status = "") =>
    status
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) =>
            char.toUpperCase()
        );

const StatusBadge = ({ status }) => {
    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                STATUS_STYLES[status] ??
                "bg-slate-100 text-slate-600"
            }`}
        >
            {formatStatus(status)}
        </span>
    );
};

export default StatusBadge;