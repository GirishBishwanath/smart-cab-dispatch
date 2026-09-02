import { useNavigate } from "react-router-dom";

import RideActions from "./RideActions.jsx";
import { ROUTES } from "../utils/constants.js";

const RideActionCard = ({
    ride,
    onUpdated,
    showDetailsLink = false,
}) => {
    const navigate = useNavigate();

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="px-5 py-5 sm:px-6 sm:py-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-sky-600">
                            Next action
                        </p>

                        <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-950">
                            Continue the ride
                        </h2>

                        <p className="mt-1.5 max-w-xl text-sm leading-5 text-slate-500">
                            Update the trip when the next milestone is
                            reached.
                        </p>
                    </div>

                    <div className="shrink-0">
                        <RideActions
                            ride={ride}
                            onUpdated={onUpdated}
                        />
                    </div>
                </div>
            </div>

            {showDetailsLink && (
                <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-5 py-3.5 sm:px-6">
                    <button
                        type="button"
                        onClick={() =>
                            navigate(ROUTES.CURRENT_RIDE)
                        }
                        className="text-xs font-bold text-slate-500 transition hover:text-slate-950"
                    >
                        View full ride details →
                    </button>
                </div>
            )}
        </section>
    );
};

export default RideActionCard;