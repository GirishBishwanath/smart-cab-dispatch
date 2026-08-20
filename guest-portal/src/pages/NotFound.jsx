import { Link } from "react-router-dom";
import { ROUTES } from "../utils/constants.js";

const NotFound = () => (
    <div className="grid min-h-[70vh] place-items-center">
        <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-600">
                404
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Page not found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
                The page you're looking for doesn't exist.
            </p>

            <Link
                to={ROUTES.DASHBOARD}
                className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white"
            >
                Back to dashboard
            </Link>
        </div>
    </div>
);

export default NotFound;