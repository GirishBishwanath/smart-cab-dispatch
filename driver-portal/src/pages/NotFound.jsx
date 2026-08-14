import { Link } from "react-router-dom";

import {
    ROUTES,
} from "../utils/constants.js";

const NotFound = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">

            <div className="text-center">

                <p className="text-sm font-semibold text-slate-500">
                    404
                </p>

                <h1 className="mt-2 text-3xl font-bold text-slate-900">
                    Page not found
                </h1>

                <p className="mt-3 text-sm text-slate-500">
                    The page you're looking for doesn't exist.
                </p>

                <Link
                    to={ROUTES.DASHBOARD}
                    className="mt-6 inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                    Go to Dashboard
                </Link>

            </div>

        </div>
    );
};

export default NotFound;