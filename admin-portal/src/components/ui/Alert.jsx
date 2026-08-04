const VARIANTS = {
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-slate-200 bg-slate-50 text-slate-700",
};

const Alert = ({ variant = "error", children, className = "" }) => {
  if (!children) return null;

  return (
    <div
      role="alert"
      className={`rounded-lg border px-3.5 py-2.5 text-sm ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </div>
  );
};

export default Alert;
