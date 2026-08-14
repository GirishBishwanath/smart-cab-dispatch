import Spinner from "./Spinner.jsx";

const Button = ({
    children,
    loading = false,
    disabled = false,
    type = "button",
    className = "",
    onClick,
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-slate-900
                px-4
                py-2.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-slate-800
                disabled:cursor-not-allowed
                disabled:opacity-60
                ${className}
            `}
        >
            {loading && (
                <Spinner size="sm" />
            )}

            {children}
        </button>
    );
};

export default Button;