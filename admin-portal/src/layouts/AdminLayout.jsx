import { Outlet } from "react-router-dom";

import PortalHeader from "../components/layout/PortalHeader.jsx";
import AdminSidebar from "../components/layout/AdminSidebar.jsx";

const AdminLayout = () => {
  return (
    <div className="h-screen flex flex-col">
      <PortalHeader title="Admin Portal" />

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;