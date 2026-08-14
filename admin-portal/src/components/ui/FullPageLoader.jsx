import Spinner from "./Spinner.jsx";

const FullPageLoader = ({ message = "Loading…" }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-3">
                <Spinner />

                <p className="text-sm text-slate-500">
                    {message}
                </p>
            </div>
        </div>
    );
};

export default FullPageLoader;