import { NavLink, Outlet } from "react-router-dom";
import {
  FaChartPie,
  FaCar,
  FaUsers,
  FaClipboardList,
  FaRoute,
} from "react-icons/fa";

import PortalHeader from "../components/layout/PortalHeader.jsx";

const menus = [
  {
    title: "Dashboard",
    icon: <FaChartPie />,
    path: "/admin/dashboard",
  },
  {
    title: "Drivers",
    icon: <FaCar />,
    path: "/admin/drivers",
  },
  {
    title: "Guests",
    icon: <FaUsers />,
    path: "/admin/guests",
  },
  {
    title: "Ride Requests",
    icon: <FaClipboardList />,
    path: "/admin/ride-requests",
  },
  {
    title: "Rides",
    icon: <FaRoute />,
    path: "/admin/rides",
  },
];

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-slate-100">

      <PortalHeader title="Admin" />

      <div className="flex">

        <aside className="w-64 bg-white border-r min-h-[calc(100vh-64px)]">

          <nav className="p-4 space-y-2">

            {menus.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                {item.icon}
                {item.title}
              </NavLink>
            ))}

          </nav>

        </aside>

        <main className="flex-1 p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default AdminLayout;