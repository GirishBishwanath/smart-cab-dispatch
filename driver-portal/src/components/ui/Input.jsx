const Input = ({
    id,
    label,
    error,
    className = "",
    ...props
}) => {
    return (
        <div className="space-y-1.5">

            {label && (
                <label
                    htmlFor={id}
                    className="block text-sm font-medium text-slate-700"
                >
                    {label}
                </label>
            )}

            <input
                id={id}
                className={`
                    w-full
                    rounded-lg
                    border
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    transition
                    ${
                        error
                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                            : "border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    }
                    disabled:cursor-not-allowed
                    disabled:bg-slate-100
                    ${className}
                `}
                {...props}
            />

            {error && (
                <p className="text-xs text-red-600">
                    {error}
                </p>
            )}

        </div>
    );
};

export default Input;