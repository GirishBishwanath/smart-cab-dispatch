import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-slate-900">
                    404
                </h1>

                <h2 className="mt-4 text-2xl font-semibold text-slate-800">
                    Page Not Found
                </h2>

                <p className="mt-2 text-slate-500">
                    The page you are looking for does not exist.
                </p>

                <Link
                    to="/"
                    className="inline-block mt-6 rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
                >
                    Go to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default NotFound;