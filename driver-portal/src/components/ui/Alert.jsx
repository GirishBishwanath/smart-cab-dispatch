const Alert = ({
    children,
    type = "error",
}) => {
    if (!children) {
        return null;
    }

    const styles = {
        error:
            "border-red-200 bg-red-50 text-red-700",
        success:
            "border-green-200 bg-green-50 text-green-700",
        info:
            "border-blue-200 bg-blue-50 text-blue-700",
    };

    return (
        <div
            className={`rounded-lg border px-4 py-3 text-sm ${styles[type]}`}
        >
            {children}
        </div>
    );
};

export default Alert;