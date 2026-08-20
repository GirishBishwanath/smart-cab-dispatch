import {
    FaEnvelope,
    FaPhone,
    FaUser,
} from "react-icons/fa6";

const ProfileCard = ({ profile }) => {
    const user = profile?.user;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-950 text-lg font-bold text-white">
                {(user?.fullName || "Guest")
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
                {user?.fullName || "Guest"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
                Guest account
            </p>

            <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-3">
                    <FaUser className="size-3 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">
                        {user?.fullName || "Not provided"}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <FaEnvelope className="size-3 text-slate-400" />
                    <span className="truncate text-sm font-medium text-slate-700">
                        {user?.email || "Not provided"}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <FaPhone className="size-3 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">
                        {user?.phone || "Not provided"}
                    </span>
                </div>
            </div>
        </section>
    );
};

export default ProfileCard;