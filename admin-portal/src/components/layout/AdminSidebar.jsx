import { NavLink } from "react-router-dom";
import {
    FaHome,
    FaCar,
    FaUsers,
    FaClipboardList,
    FaRoute,
} from "react-icons/fa";

const links = [
    {
        name: "Dashboard",
        path: "/admin/dashboard",
        icon: <FaHome />,
    },
    {
        name: "Drivers",
        path: "/admin/drivers",
        icon: <FaCar />,
    },
    {
        name: "Guests",
        path: "/admin/guests",
        icon: <FaUsers />,
    },
    {
        name: "Ride Requests",
        path: "/admin/ride-requests",
        icon: <FaClipboardList />,
    },
    {
        name: "Rides",
        path: "/admin/rides",
        icon: <FaRoute />,
    },
];

const AdminSidebar = () => {
    return (
        <aside className="w-64 bg-slate-900 text-white min-h-screen">
            <div className="p-6 text-xl font-bold border-b border-slate-700">
                Smart Cab
            </div>

            <nav className="p-4 space-y-2">
                {links.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-4 py-3 transition ${isActive
                                ? "bg-white text-slate-900"
                                : "hover:bg-slate-800"
                            }`
                        }
                    >
                        {item.icon}
                        {item.name}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default AdminSidebar;